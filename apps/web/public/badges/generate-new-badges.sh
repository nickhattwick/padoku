#!/bin/bash
cd /home/ec2-user/.openclaw/workspace/engine/apps/web/public/badges
SCRIPT="/home/ec2-user/.npm-global/lib/node_modules/openclaw/skills/openai-image-gen/scripts/gen.py"

generate() {
  local name="$1"
  local prompt="$2"
  echo "Generating: $name"
  mkdir -p "./$name"
  python3 "$SCRIPT" --model gpt-image-1 --background transparent --output-format png --size 1024x1024 --quality high --out-dir "./$name" --prompt "$prompt" --count 1
}

# Created Badges
generate "create-01-first-idea" "Racing badge emblem, bronze frame, single lightbulb with small spark, first idea brainstorm theme, square medal, transparent background, no text"
generate "create-10-planner" "Racing badge emblem, bronze frame, clipboard with racing strategy diagram, planner organizer theme, square medal, transparent background, no text"
generate "create-25-strategist" "Racing badge emblem, silver frame, chess piece knight on race track, strategic thinking theme, square medal, transparent background, no text"
generate "create-50-architect" "Racing badge emblem, silver frame, blueprint of race car with compass and ruler, architect designer theme, square medal, transparent background, no text"
generate "create-100-mastermind" "Racing badge emblem, gold frame, brain with racing circuits and gears, mastermind genius theme, square medal, transparent background, no text"
generate "create-250-visionary" "Racing badge emblem, gold frame, crystal ball showing future race track, visionary foresight theme, square medal, transparent background, no text"
generate "create-500-empire-builder" "Racing badge emblem, platinum frame, racing empire skyline with multiple tracks, empire builder theme, square medal, transparent background, no text"
generate "create-1000-legendary" "Racing badge emblem, diamond frame, ancient scroll with golden pen and racing symbols, legendary architect immortal theme, square medal, transparent background, no text"

# Started Badges
generate "start-01-ignition" "Racing badge emblem, bronze frame, key in ignition with small spark, first ignition start theme, square medal, transparent background, no text"
generate "start-10-revving" "Racing badge emblem, bronze frame, tachometer needle rising with engine rev, revving up theme, square medal, transparent background, no text"
generate "start-25-momentum" "Racing badge emblem, silver frame, rolling wheel with motion blur, building momentum theme, square medal, transparent background, no text"
generate "start-50-cruising" "Racing badge emblem, silver frame, race car on highway with wind streaks, smooth cruising theme, square medal, transparent background, no text"
generate "start-100-accelerator" "Racing badge emblem, gold frame, foot pressing accelerator pedal with flames, heavy accelerator theme, square medal, transparent background, no text"
generate "start-250-velocity" "Racing badge emblem, gold frame, speedometer maxed out with lightning, maximum velocity theme, square medal, transparent background, no text"
generate "start-500-hyperdrive" "Racing badge emblem, platinum frame, warp speed tunnel with starlight streaks, hyperdrive engaged theme, square medal, transparent background, no text"
generate "start-1000-lightspeed" "Racing badge emblem, diamond frame, car dissolving into pure light energy, lightspeed transcendence theme, square medal, transparent background, no text"

# Unblocked Badges
generate "unblock-01-breakthrough" "Racing badge emblem, bronze frame, brick wall with crack and light shining through, first breakthrough theme, square medal, transparent background, no text"
generate "unblock-05-obstacle-crusher" "Racing badge emblem, bronze frame, monster truck crushing barriers, obstacle crusher theme, square medal, transparent background, no text"
generate "unblock-10-wall-breaker" "Racing badge emblem, silver frame, race car smashing through concrete wall explosion, wall breaker theme, square medal, transparent background, no text"
generate "unblock-25-unstoppable" "Racing badge emblem, silver frame, tank treads rolling over obstacles, unstoppable force theme, square medal, transparent background, no text"
generate "unblock-50-juggernaut" "Racing badge emblem, gold frame, armored juggernaut vehicle destroying everything, juggernaut power theme, square medal, transparent background, no text"
generate "unblock-100-demolisher" "Racing badge emblem, diamond frame, nuclear explosion clearing path, ultimate demolisher theme, square medal, transparent background, no text"

echo "Created, Started, and Unblocked badges generated!"
