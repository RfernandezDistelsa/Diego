#!/usr/bin/env bash
# Workshop status line for Claude Code.
# Reads JSON from stdin, prints a one-line summary.
#
# Smart billing:
#   - If `.rate_limits` is present → Claude.ai subscription (Pro/Max).
#     Show an *estimated* token cost (no real $ on subscription) plus
#     the 5h / 7d limit bars so participants see when they'll cap out.
#   - Otherwise → API key (pay-as-you-go). Show the real `cost.total_cost_usd`.

set -u

# ── colors ────────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"
RED="\033[31m"
YELLOW="\033[33m"
GREEN="\033[32m"
CYAN="\033[36m"
BLUE="\033[34m"
WHITE="\033[37m"

input=$(cat)
jq_val() { printf '%s' "$input" | jq -r "$1 // empty" 2>/dev/null; }

# ── context window ────────────────────────────────────────────────────────────
used_pct=$(jq_val '.context_window.used_percentage')
ctx_size=$(jq_val '.context_window.context_window_size')
total_in=$(jq_val '.context_window.total_input_tokens // 0')
total_out=$(jq_val '.context_window.total_output_tokens // 0')

ctx_part=""
if [ -n "$used_pct" ] && [ -n "$ctx_size" ]; then
    used_int=$(printf '%.0f' "$used_pct")
    filled=$(awk "BEGIN{n=int($used_pct/10); if(n>10)n=10; print n}")
    empty=$((10 - filled))
    bar=""
    for i in $(seq 1 "$filled"); do bar="${bar}█"; done
    for i in $(seq 1 "$empty"); do bar="${bar}░"; done

    if [ "$used_int" -ge 80 ]; then ctx_color="$RED"
    elif [ "$used_int" -ge 60 ]; then ctx_color="$YELLOW"
    else ctx_color="$GREEN"; fi

    # Format context size
    if [ "$ctx_size" -ge 1000000 ] 2>/dev/null; then
        ctx_str=$(awk "BEGIN{printf \"%.0fM\", $ctx_size/1000000}")
    else
        ctx_str=$(awk "BEGIN{printf \"%.0fk\", $ctx_size/1000}")
    fi

    # Format used tokens
    used_tokens=$((total_in + total_out))
    if [ "$used_tokens" -ge 1000 ] 2>/dev/null; then
        used_str=$(awk "BEGIN{printf \"%.0fk\", $used_tokens/1000}")
    else
        used_str="$used_tokens"
    fi

    ctx_part="${ctx_color}${BOLD}🧠 CTX${RESET}${ctx_color} ${bar} ${used_str} / ${ctx_str} (${used_int}%)${RESET}"
fi

# ── model ─────────────────────────────────────────────────────────────────────
model_display=$(jq_val '.model.display_name')
model_id=$(jq_val '.model.id')
model_part=""
if [ -n "$model_display" ]; then
    friendly=$(printf '%s' "$model_display" | sed 's/^[Cc]laude[[:space:]]*//')
    model_part="${DIM}${CYAN}⚡ ${friendly}${RESET}"
fi

# ── git branch ────────────────────────────────────────────────────────────────
cwd=$(jq_val '.workspace.current_dir')
[ -z "$cwd" ] && cwd=$(jq_val '.cwd')
[ -z "$cwd" ] && cwd="$PWD"

git_part=""
if [ -n "$cwd" ] && git -C "$cwd" rev-parse --git-dir >/dev/null 2>&1; then
    branch=$(git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null \
             || git -C "$cwd" rev-parse --short HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
        [ ${#branch} -gt 24 ] && branch="${branch:0:21}..."
        git_part="${DIM}${BLUE} ${branch}${RESET}"
    fi
fi

# ── billing: subscription vs API ──────────────────────────────────────────────
# Subscription mode is detected by the presence of an actual numeric
# rate-limit percentage. An empty .rate_limits object on its own does NOT
# count — we only classify as subscription when there's real data to show.
is_subscription=$(printf '%s' "$input" | jq -r '
  (((.rate_limits.five_hour.used_percentage // empty) | type) == "number")
  or (((.rate_limits.seven_day.used_percentage // empty) | type) == "number")
' 2>/dev/null)

# Token rates per 1M tokens (input, output). Defaults to Haiku 4.5.
# We pick based on model_id so the estimate scales with Sonnet/Opus too.
case "$model_id" in
    *opus*)   in_rate=15; out_rate=75 ;;
    *sonnet*) in_rate=3;  out_rate=15 ;;
    *haiku*|*) in_rate=1;  out_rate=5 ;;
esac

cost_part=""
if [ "$is_subscription" = "true" ]; then
    # Subscription: estimate from session tokens, accounting for cache savings.
    # Cache read tokens cost 90% less than regular input tokens.
    cache_read=$(jq_val '.context_window.current_usage.cache_read_input_tokens // 0')
    cache_create=$(jq_val '.context_window.current_usage.cache_creation_input_tokens // 0')
    regular_in=$(jq_val '.context_window.current_usage.input_tokens // 0')
    sess_out=$(jq_val '.context_window.total_output_tokens // 0')

    # Calculate effective tokens: cache_read at 10% cost, rest at full cost
    eff_in=$(awk "BEGIN{printf \"%.0f\", $cache_read * 0.1 + $cache_create + $regular_in}")
    est=$(awk "BEGIN{printf \"%.3f\", ($eff_in * $in_rate + $sess_out * $out_rate) / 1000000}")
    cost_part="${DIM}${GREEN}📊 ~\$${est} est${RESET}${DIM} (sub)${RESET}"
else
    # API: use real spend.
    total_cost=$(jq_val '.cost.total_cost_usd // 0')
    if awk "BEGIN{exit !($total_cost > 0)}" 2>/dev/null; then
        cost_fmt=$(awk "BEGIN{printf \"\$%.3f\", $total_cost}")
        if awk "BEGIN{exit !($total_cost >= 1.0)}" 2>/dev/null; then cc="$RED"
        elif awk "BEGIN{exit !($total_cost >= 0.1)}" 2>/dev/null; then cc="$YELLOW"
        else cc="$GREEN"; fi
        cost_part="${cc}💰 ${cost_fmt}${RESET}${DIM} (api)${RESET}"
    fi
fi

# ── cache ────────────────────────────────────────────────────────────────────
cache_read=$(jq_val '.context_window.current_usage.cache_read_input_tokens // 0')
cache_create=$(jq_val '.context_window.current_usage.cache_creation_input_tokens // 0')
cache_part=""

if awk "BEGIN{exit !($cache_read > 0)}" 2>/dev/null; then
    # Tokens saved: cache_read tokens at 90% discount
    tokens_saved=$(awk "BEGIN{printf \"%.0f\", $cache_read * 0.9}")
    # Cost saved: tokens_saved * rate per token
    cost_saved=$(awk "BEGIN{printf \"%.3f\", $tokens_saved * $in_rate / 1000000}")

    # Format tokens (k for thousands)
    if [ "$tokens_saved" -ge 1000 ] 2>/dev/null; then
        tokens_str=$(awk "BEGIN{printf \"%.0fk\", $tokens_saved/1000}")
    else
        tokens_str="$tokens_saved"
    fi

    cache_part="${DIM}${GREEN}💾 saved ${tokens_str} / \$${cost_saved}${RESET}"
elif awk "BEGIN{exit !($cache_create > 0)}" 2>/dev/null; then
    # Cache is being written but not read yet
    cache_part="${DIM}${YELLOW}💾 writing${RESET}"
fi

# ── rate limits (subscription only) ───────────────────────────────────────────
rate_part=""
if [ "$is_subscription" = "true" ]; then
    rl_bar() {
        local pct="$1" filled empty bar
        filled=$(awk "BEGIN{n=int($pct/20); if(n>5)n=5; print n}")
        empty=$((5 - filled))
        bar=""
        for i in $(seq 1 "$filled"); do bar="${bar}█"; done
        for i in $(seq 1 "$empty"); do bar="${bar}░"; done
        printf '%s' "$bar"
    }
    rl_color() {
        local pct="$1"
        if [ "$pct" -ge 80 ]; then printf '%s' "$RED"
        elif [ "$pct" -ge 60 ]; then printf '%s' "$YELLOW"
        else printf '%s' "$GREEN"; fi
    }
    five_h=$(jq_val '.rate_limits.five_hour.used_percentage')
    seven_d=$(jq_val '.rate_limits.seven_day.used_percentage')
    if [ -n "$five_h" ]; then
        five_int=$(printf '%.0f' "$five_h")
        c=$(rl_color "$five_int"); b=$(rl_bar "$five_int")
        rate_part="${c}⏳ 5h ${b} ${five_int}%${RESET}"
    fi
    if [ -n "$seven_d" ]; then
        seven_int=$(printf '%.0f' "$seven_d")
        c=$(rl_color "$seven_int"); b=$(rl_bar "$seven_int")
        sep=""; [ -n "$rate_part" ] && sep="${DIM} · ${RESET}"
        rate_part="${rate_part}${sep}${c}📅 7d ${b} ${seven_int}%${RESET}"
    fi
fi

# ── assemble ──────────────────────────────────────────────────────────────────
SEP="${DIM} │ ${RESET}"
parts=()
[ -n "$ctx_part" ]   && parts+=("$ctx_part")
[ -n "$model_part" ] && parts+=("$model_part")
[ -n "$git_part" ]   && parts+=("$git_part")
[ -n "$cost_part" ]  && parts+=("$cost_part")
[ -n "$cache_part" ] && parts+=("$cache_part")
[ -n "$rate_part" ]  && parts+=("$rate_part")

line=""
for p in "${parts[@]}"; do
    if [ -z "$line" ]; then line="$p"
    else line="${line}${SEP}${p}"; fi
done
printf "%b\n" "$line"
