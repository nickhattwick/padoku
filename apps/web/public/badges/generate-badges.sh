#!/bin/bash
cd /home/ec2-user/.openclaw/workspace/engine/apps/web/public/badges
SCRIPT="/home/ec2-user/.npm-global/lib/node_modules/openclaw/skills/openai-image-gen/scripts/gen.py"

generate() {
  local name="$1"
  local prompt="$2"
  echo "Generating: $name"
  python3 "$SCRIPT" --model gpt-image-1 --background transparent --output-format png --size 1024x1024 --quality high --out-dir "./$name" --prompt "$prompt" --count 1
}

# Monthly Badges
generate "jan-cold-start" "Racing badge emblem, retro arcade style, chrome frame, icy blue snowflake center with frozen speedometer, icicles, winter racing theme, square medal, transparent background, no text"
generate "feb-heartbreaker" "Racing badge emblem, retro arcade style, gold and red chrome frame, heart-shaped racing wheel center, speed lines, Valentine racing theme, square medal, transparent background, no text"
generate "mar-lucky-lap" "Racing badge emblem, retro arcade style, green and gold chrome frame, four-leaf clover with checkered flag pattern, Irish racing luck theme, square medal, transparent background, no text"
generate "apr-rain-racer" "Racing badge emblem, retro arcade style, silver and blue chrome frame, rain drops with racing car splashing through puddle, storm cloud, wet track theme, square medal, transparent background, no text"
generate "may-bloom-boost" "Racing badge emblem, retro arcade style, pink and green chrome frame, cherry blossoms around a nitro boost flame, spring flowers racing theme, square medal, transparent background, no text"
generate "jun-solar-flare" "Racing badge emblem, retro arcade style, orange and gold chrome frame, blazing sun with speed lines radiating outward, summer heat racing theme, square medal, transparent background, no text"
generate "jul-firework-finish" "Racing badge emblem, retro arcade style, red white blue chrome frame, fireworks explosion with checkered flag, Independence Day racing theme, square medal, transparent background, no text"
generate "aug-beach-burnout" "Racing badge emblem, retro arcade style, teal and orange chrome frame, palm tree with tire burnout marks in sand, beach vacation racing theme, square medal, transparent background, no text"
generate "sep-back-to-track" "Racing badge emblem, retro arcade style, yellow and brown chrome frame, pencil shaped like race car with books, back to school racing theme, square medal, transparent background, no text"
generate "oct-phantom-racer" "Racing badge emblem, retro arcade style, purple and black chrome frame, ghostly translucent race car with glowing eyes, spooky Halloween racing theme, square medal, transparent background, no text"
generate "nov-turbo-turkey" "Racing badge emblem, retro arcade style, orange and brown chrome frame, turkey wearing racing helmet with exhaust flames from tail feathers, Thanksgiving racing theme, square medal, transparent background, no text"
generate "dec-sleigh-rider" "Racing badge emblem, retro arcade style, red and green chrome frame, racing sleigh with jet engines and Christmas lights, holiday snow drift racing theme, square medal, transparent background, no text"

# Task Badges
generate "task-01-pit-stop" "Racing badge emblem, bronze frame, single wrench tool crossed with checkered flag, beginner mechanic theme, square medal, transparent background, no text"
generate "task-10-tire-change" "Racing badge emblem, bronze frame, racing tire with lug nuts spinning off, pit crew action theme, square medal, transparent background, no text"
generate "task-25-fueled-up" "Racing badge emblem, silver frame, fuel pump nozzle with flames coming out, high octane energy theme, square medal, transparent background, no text"
generate "task-50-engine-running" "Racing badge emblem, silver frame, powerful V8 engine with exhaust flames, motor power theme, square medal, transparent background, no text"
generate "task-100-full-throttle" "Racing badge emblem, gold frame, throttle pedal pressed to floor with speed lines, maximum acceleration theme, square medal, transparent background, no text"
generate "task-250-nitro-boost" "Racing badge emblem, gold frame, NOS bottle with blue flames exploding outward, nitrous oxide boost theme, square medal, transparent background, no text"
generate "task-500-lightning-lap" "Racing badge emblem, platinum frame, lightning bolt striking through race track oval, electric speed theme, square medal, transparent background, no text"
generate "task-1000-pit-chief" "Racing badge emblem, diamond frame with crown, crossed flags with golden wrench scepter, pit crew royalty theme, square medal, transparent background, no text"

# Race Win Badges
generate "race-01-podium" "Racing badge emblem, bronze frame, podium third place with small trophy, first victory theme, square medal, transparent background, no text"
generate "race-05-contender" "Racing badge emblem, silver frame, podium second place with medium trophy, regular competitor theme, square medal, transparent background, no text"
generate "race-10-champion" "Racing badge emblem, gold frame, podium first place with large trophy and confetti, circuit champion theme, square medal, transparent background, no text"
generate "race-25-victor" "Racing badge emblem, gold frame with laurel wreath, giant trophy with checkered flags, grand prix winner theme, square medal, transparent background, no text"
generate "race-50-legend" "Racing badge emblem, platinum frame with stars, legendary helmet with flames and crown, racing legend immortal theme, square medal, transparent background, no text"
generate "race-100-unbeatable" "Racing badge emblem, black and gold frame, skull wearing racing helmet with fire eyes, death race undefeated theme, square medal, transparent background, no text"

# Streak Badges
generate "streak-03-warming" "Racing badge emblem, orange frame, small campfire flame, warming up engine theme, square medal, transparent background, no text"
generate "streak-07-on-fire" "Racing badge emblem, orange-red frame, medium bonfire with racing sparks, on fire streak theme, square medal, transparent background, no text"
generate "streak-14-volcanic" "Racing badge emblem, red frame, erupting volcano with lava and race car silhouette, volcanic power theme, square medal, transparent background, no text"
generate "streak-30-meteor" "Racing badge emblem, red-orange frame, flaming meteor streaking across sky with speed lines, unstoppable force theme, square medal, transparent background, no text"
generate "streak-60-supernova" "Racing badge emblem, purple and orange frame, exploding star with racing energy waves, supernova explosion theme, square medal, transparent background, no text"
generate "streak-90-cosmic" "Racing badge emblem, deep purple frame, swirling galaxy with race track spiral, cosmic power theme, square medal, transparent background, no text"
generate "streak-180-galactic" "Racing badge emblem, blue and purple frame, entire galaxy with racing comet trail, galactic conquest theme, square medal, transparent background, no text"
generate "streak-365-eternal" "Racing badge emblem, rainbow chrome frame, infinity symbol made of fire with eternal flame, immortal dedication theme, square medal, transparent background, no text"

# Grid Points Badges
generate "gp-100-first-lap" "Racing badge emblem, copper frame, starting line with single race car, first lap beginner theme, square medal, transparent background, no text"
generate "gp-500-qualifier" "Racing badge emblem, bronze frame, qualifying position board with stopwatch, qualifier theme, square medal, transparent background, no text"
generate "gp-1000-competitor" "Racing badge emblem, silver frame, racing helmet with determined eyes, true competitor theme, square medal, transparent background, no text"
generate "gp-2500-veteran" "Racing badge emblem, silver-gold frame, worn racing gloves with medals, veteran racer theme, square medal, transparent background, no text"
generate "gp-5000-elite" "Racing badge emblem, gold frame, elite racing suit with star emblem, elite status theme, square medal, transparent background, no text"
generate "gp-10000-diamond" "Racing badge emblem, diamond-encrusted frame, sparkling diamond race car, diamond driver luxury theme, square medal, transparent background, no text"
generate "gp-25000-master" "Racing badge emblem, platinum frame, checkered pattern mastery crown, grid master supreme theme, square medal, transparent background, no text"
generate "gp-50000-king" "Racing badge emblem, golden crown frame with jewels, throne made of trophies and checkered flags, grid point royalty theme, square medal, transparent background, no text"

# Special Badges
generate "special-early-bird" "Racing badge emblem, yellow and orange frame, sunrise with rooster wearing racing goggles, early morning racer theme, square medal, transparent background, no text"
generate "special-night-owl" "Racing badge emblem, dark blue frame, owl with glowing headlight eyes under moon, midnight racer theme, square medal, transparent background, no text"
generate "special-backlog-buster" "Racing badge emblem, orange frame, dynamite explosion clearing pile of papers, backlog destruction theme, square medal, transparent background, no text"
generate "special-speed-demon" "Racing badge emblem, red and black frame, demon with horns driving flaming race car, speed demon theme, square medal, transparent background, no text"
generate "special-zen-master" "Racing badge emblem, teal and white frame, peaceful racing Buddha in lotus position with steering wheel, zen calm theme, square medal, transparent background, no text"
generate "special-clutch-player" "Racing badge emblem, purple frame, hand grabbing checkered flag at last second, clutch victory theme, square medal, transparent background, no text"

echo "All badges generated!"
