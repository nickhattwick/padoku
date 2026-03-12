#!/bin/bash
cd /home/ec2-user/.openclaw/workspace/engine/apps/web/public/badges
SCRIPT="/home/ec2-user/.npm-global/lib/node_modules/openclaw/skills/openai-image-gen/scripts/gen.py"

generate() {
  local name="$1"
  local prompt="$2"
  if [ -d "./$name" ] && [ -f "./$name/image_0.png" ]; then
    echo "Skipping $name (already exists)"
    return
  fi
  echo "Generating: $name"
  mkdir -p "./$name"
  python3 "$SCRIPT" --model gpt-image-1 --background transparent --output-format png --size 1024x1024 --quality high --out-dir "./$name" --prompt "$prompt" --count 1
  # Rename to image_0.png
  img=$(ls "./$name"/*.png 2>/dev/null | head -1)
  if [ -n "$img" ] && [ "$img" != "./$name/image_0.png" ]; then
    mv "$img" "./$name/image_0.png"
  fi
  sleep 2  # Rate limit buffer
}

# Monthly GP - January
generate "gp-jan-participant" "Racing badge emblem, ice blue frame, snowflake with small race flag, January GP participant theme, square medal, transparent background, no text"
generate "gp-jan-bronze" "Racing badge emblem, bronze frame with ice crystals, snowflake behind bronze podium P3, January GP third place theme, square medal, transparent background, no text"
generate "gp-jan-silver" "Racing badge emblem, silver frame with frost pattern, icy trophy silver P2 podium, January GP second place theme, square medal, transparent background, no text"
generate "gp-jan-gold" "Racing badge emblem, gold frame with diamond ice, golden crown on frozen trophy P1 champion, January GP winner theme, square medal, transparent background, no text"

# Monthly GP - February
generate "gp-feb-participant" "Racing badge emblem, pink frame, heart with small race flag, February GP participant theme, square medal, transparent background, no text"
generate "gp-feb-bronze" "Racing badge emblem, bronze frame with hearts, cupid arrow behind bronze podium P3, February GP third place theme, square medal, transparent background, no text"
generate "gp-feb-silver" "Racing badge emblem, silver frame with roses, heart trophy silver P2 podium, February GP second place theme, square medal, transparent background, no text"
generate "gp-feb-gold" "Racing badge emblem, gold frame with red hearts, golden heart crown trophy P1 champion, February GP winner theme, square medal, transparent background, no text"

# Monthly GP - March
generate "gp-mar-participant" "Racing badge emblem, green frame, shamrock with small race flag, March GP participant theme, square medal, transparent background, no text"
generate "gp-mar-bronze" "Racing badge emblem, bronze frame with clovers, lucky charm behind bronze podium P3, March GP third place theme, square medal, transparent background, no text"
generate "gp-mar-silver" "Racing badge emblem, silver frame with emeralds, pot of gold silver P2 podium, March GP second place theme, square medal, transparent background, no text"
generate "gp-mar-gold" "Racing badge emblem, gold frame with four-leaf clovers, rainbow golden trophy P1 champion, March GP winner theme, square medal, transparent background, no text"

# Monthly GP - April
generate "gp-apr-participant" "Racing badge emblem, blue frame, rain cloud with small race flag, April GP participant theme, square medal, transparent background, no text"
generate "gp-apr-bronze" "Racing badge emblem, bronze frame with raindrops, umbrella behind bronze podium P3, April GP third place theme, square medal, transparent background, no text"
generate "gp-apr-silver" "Racing badge emblem, silver frame with lightning, storm trophy silver P2 podium, April GP second place theme, square medal, transparent background, no text"
generate "gp-apr-gold" "Racing badge emblem, gold frame with rainbow, golden sun breaking clouds P1 champion, April GP winner theme, square medal, transparent background, no text"

# Monthly GP - May
generate "gp-may-participant" "Racing badge emblem, pink frame, cherry blossom with small race flag, May GP participant theme, square medal, transparent background, no text"
generate "gp-may-bronze" "Racing badge emblem, bronze frame with flowers, tulip behind bronze podium P3, May GP third place theme, square medal, transparent background, no text"
generate "gp-may-silver" "Racing badge emblem, silver frame with petals, flower crown silver P2 podium, May GP second place theme, square medal, transparent background, no text"
generate "gp-may-gold" "Racing badge emblem, gold frame with blossoms, golden butterfly trophy P1 champion, May GP winner theme, square medal, transparent background, no text"

# Monthly GP - June
generate "gp-jun-participant" "Racing badge emblem, orange frame, sun with small race flag, June GP participant theme, square medal, transparent background, no text"
generate "gp-jun-bronze" "Racing badge emblem, bronze frame with sun rays, sunglasses behind bronze podium P3, June GP third place theme, square medal, transparent background, no text"
generate "gp-jun-silver" "Racing badge emblem, silver frame with heat waves, summer trophy silver P2 podium, June GP second place theme, square medal, transparent background, no text"
generate "gp-jun-gold" "Racing badge emblem, gold frame blazing with light, golden sun king trophy P1 champion, June GP winner theme, square medal, transparent background, no text"

# Monthly GP - July
generate "gp-jul-participant" "Racing badge emblem, red white blue frame, firework with small race flag, July GP participant theme, square medal, transparent background, no text"
generate "gp-jul-bronze" "Racing badge emblem, bronze frame with stars, sparkler behind bronze podium P3, July GP third place theme, square medal, transparent background, no text"
generate "gp-jul-silver" "Racing badge emblem, silver frame with stripes, liberty trophy silver P2 podium, July GP second place theme, square medal, transparent background, no text"
generate "gp-jul-gold" "Racing badge emblem, gold frame with fireworks explosion, golden eagle trophy P1 champion, July GP winner theme, square medal, transparent background, no text"

# Monthly GP - August
generate "gp-aug-participant" "Racing badge emblem, teal frame, palm tree with small race flag, August GP participant theme, square medal, transparent background, no text"
generate "gp-aug-bronze" "Racing badge emblem, bronze frame with sand, beach ball behind bronze podium P3, August GP third place theme, square medal, transparent background, no text"
generate "gp-aug-silver" "Racing badge emblem, silver frame with waves, surfboard trophy silver P2 podium, August GP second place theme, square medal, transparent background, no text"
generate "gp-aug-gold" "Racing badge emblem, gold frame with sunset, golden tropical trophy P1 champion, August GP winner theme, square medal, transparent background, no text"

# Monthly GP - September
generate "gp-sep-participant" "Racing badge emblem, orange brown frame, falling leaf with small race flag, September GP participant theme, square medal, transparent background, no text"
generate "gp-sep-bronze" "Racing badge emblem, bronze frame with acorns, apple behind bronze podium P3, September GP third place theme, square medal, transparent background, no text"
generate "gp-sep-silver" "Racing badge emblem, silver frame with leaves, harvest trophy silver P2 podium, September GP second place theme, square medal, transparent background, no text"
generate "gp-sep-gold" "Racing badge emblem, gold frame with autumn wreath, golden cornucopia trophy P1 champion, September GP winner theme, square medal, transparent background, no text"

# Monthly GP - October
generate "gp-oct-participant" "Racing badge emblem, purple black frame, pumpkin with small race flag, October GP participant theme, square medal, transparent background, no text"
generate "gp-oct-bronze" "Racing badge emblem, bronze frame with bats, ghost behind bronze podium P3, October GP third place theme, square medal, transparent background, no text"
generate "gp-oct-silver" "Racing badge emblem, silver frame with cobwebs, skull trophy silver P2 podium, October GP second place theme, square medal, transparent background, no text"
generate "gp-oct-gold" "Racing badge emblem, gold frame with jack-o-lanterns, golden phantom trophy P1 champion, October GP winner theme, square medal, transparent background, no text"

# Monthly GP - November
generate "gp-nov-participant" "Racing badge emblem, brown orange frame, turkey feather with small race flag, November GP participant theme, square medal, transparent background, no text"
generate "gp-nov-bronze" "Racing badge emblem, bronze frame with leaves, pilgrim hat behind bronze podium P3, November GP third place theme, square medal, transparent background, no text"
generate "gp-nov-silver" "Racing badge emblem, silver frame with wheat, feast trophy silver P2 podium, November GP second place theme, square medal, transparent background, no text"
generate "gp-nov-gold" "Racing badge emblem, gold frame with cornucopia, golden turkey trophy P1 champion, November GP winner theme, square medal, transparent background, no text"

# Monthly GP - December
generate "gp-dec-participant" "Racing badge emblem, red green frame, snowflake with small race flag, December GP participant theme, square medal, transparent background, no text"
generate "gp-dec-bronze" "Racing badge emblem, bronze frame with holly, candy cane behind bronze podium P3, December GP third place theme, square medal, transparent background, no text"
generate "gp-dec-silver" "Racing badge emblem, silver frame with ornaments, christmas tree trophy silver P2 podium, December GP second place theme, square medal, transparent background, no text"
generate "gp-dec-gold" "Racing badge emblem, gold frame with presents, golden star trophy P1 champion, December GP winner theme, square medal, transparent background, no text"

# Seasonal Championships
generate "season-winter-participant" "Racing badge emblem, ice blue frame, snowman with small race flag, Winter championship participant theme, square medal, transparent background, no text"
generate "season-winter-bronze" "Racing badge emblem, bronze frame with icicles, frozen podium P3, Winter championship third place theme, square medal, transparent background, no text"
generate "season-winter-silver" "Racing badge emblem, silver frame with frost, ice sculpture trophy P2, Winter championship second place theme, square medal, transparent background, no text"
generate "season-winter-gold" "Racing badge emblem, gold frame with diamond snowflakes, golden ice crown trophy P1, Winter champion theme, square medal, transparent background, no text"

generate "season-spring-participant" "Racing badge emblem, green pink frame, butterfly with small race flag, Spring championship participant theme, square medal, transparent background, no text"
generate "season-spring-bronze" "Racing badge emblem, bronze frame with flowers, garden podium P3, Spring championship third place theme, square medal, transparent background, no text"
generate "season-spring-silver" "Racing badge emblem, silver frame with blossoms, floral trophy P2, Spring championship second place theme, square medal, transparent background, no text"
generate "season-spring-gold" "Racing badge emblem, gold frame with cherry blossoms, golden bloom trophy P1, Spring champion theme, square medal, transparent background, no text"

generate "season-summer-participant" "Racing badge emblem, orange yellow frame, sun with small race flag, Summer championship participant theme, square medal, transparent background, no text"
generate "season-summer-bronze" "Racing badge emblem, bronze frame with sun rays, beach podium P3, Summer championship third place theme, square medal, transparent background, no text"
generate "season-summer-silver" "Racing badge emblem, silver frame with heat waves, summer trophy P2, Summer championship second place theme, square medal, transparent background, no text"
generate "season-summer-gold" "Racing badge emblem, gold frame blazing with flames, golden sun trophy P1, Summer champion theme, square medal, transparent background, no text"

generate "season-fall-participant" "Racing badge emblem, orange brown frame, maple leaf with small race flag, Fall championship participant theme, square medal, transparent background, no text"
generate "season-fall-bronze" "Racing badge emblem, bronze frame with leaves, harvest podium P3, Fall championship third place theme, square medal, transparent background, no text"
generate "season-fall-silver" "Racing badge emblem, silver frame with acorns, autumn trophy P2, Fall championship second place theme, square medal, transparent background, no text"
generate "season-fall-gold" "Racing badge emblem, gold frame with golden leaves, harvest king trophy P1, Fall champion theme, square medal, transparent background, no text"

# Annual Championship
generate "champ-participant" "Racing badge emblem, platinum frame, world globe with racing flag, Annual championship participant theme, square medal, transparent background, no text"
generate "champ-bronze" "Racing badge emblem, bronze frame with laurels, world championship podium P3, Annual third place theme, square medal, transparent background, no text"
generate "champ-silver" "Racing badge emblem, silver frame with stars, world trophy P2, Annual championship second place theme, square medal, transparent background, no text"
generate "champ-gold" "Racing badge emblem, golden diamond frame with crown jewels, world champion trophy with globe P1, World champion ultimate glory theme, square medal, transparent background, no text"

echo "All GP, Seasonal, and Championship badges generated!"
