#!/bin/bash
# DALL-E 3 Racer Portrait Generator

OUTPUT_DIR="/home/ec2-user/.openclaw/workspace/engine/apps/web/public/racers"

generate_image() {
    local racer_id="$1"
    local prompt="$2"
    local output_file="$OUTPUT_DIR/$racer_id.png"
    
    if [ -f "$output_file" ]; then
        echo "⏭️  Skipping $racer_id (already exists)"
        return 0
    fi
    
    echo "🎨 Generating: $racer_id"
    
    response=$(curl -s https://api.openai.com/v1/images/generations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -d "{
        \"model\": \"dall-e-3\",
        \"prompt\": \"$prompt\",
        \"n\": 1,
        \"size\": \"1024x1024\",
        \"quality\": \"hd\",
        \"style\": \"vivid\"
      }")
    
    # Extract URL from response
    url=$(echo "$response" | jq -r '.data[0].url // empty')
    
    if [ -z "$url" ]; then
        error=$(echo "$response" | jq -r '.error.message // "Unknown error"')
        echo "❌ Failed: $racer_id - $error"
        return 1
    fi
    
    # Download the image
    curl -s "$url" -o "$output_file"
    
    if [ -f "$output_file" ]; then
        echo "✅ Saved: $output_file"
    else
        echo "❌ Download failed: $racer_id"
        return 1
    fi
}

# Base style for all portraits
STYLE="Cartoon stylized portrait, vibrant colors, racing theme, expressive character, dynamic pose, checkered flag motifs, speed lines background"

# PRO TIER
generate_image "gordon-gearshift" "$STYLE. An intense red-faced chef in a white chef hat and apron, gripping a giant spatula like a weapon. He's driving a modified food truck with smoke stacks shaped like salt shakers. His expression shows fierce determination, sweat on his brow. Kitchen equipment rattles in the background."

generate_image "lunar-larry" "$STYLE. A dreamy astronaut in a vintage NASA spacesuit with mission patches, sitting in a retrofitted lunar rover with bouncy wheels. Stars and moon reflected in his visor, peaceful expression as he floats slightly above his seat. Moon dust trails behind."

generate_image "dj-drift" "$STYLE. A cool DJ wearing oversized headphones, one hand on a turntable mounted in their neon-lit sports car. Purple and pink LED lights illuminate everything. Vinyl records fly through the air. Confident smirk, sunglasses at night."

generate_image "blaze-brady" "$STYLE. A heroic firefighter in full gear with reflective stripes, driving a modified red fire truck with flame decals. A dalmatian co-pilot sits in the passenger seat wearing goggles. Water cannons point forward, heroic pose with one fist raised."

generate_image "professor-propulsion" "$STYLE. A mad scientist with crazy white hair sticking out in all directions, lab coat billowing. Driving a car covered in bubbling beakers, tesla coils, and smoking tubes. Wild excited eyes, goggles on forehead, maniacal grin."

generate_image "houdini-hank" "$STYLE. An elegant magician in tuxedo and flowing cape, top hat on head. Driving a sleek vintage black car surrounded by floating playing cards. Mysterious smile, one eyebrow raised, handcuffs dangling from rearview mirror."

generate_image "nana-nitro" "$STYLE. A fierce elderly grandmother with silver hair in a bun, wearing driving gloves and racing goggles. Behind the wheel of a mint-condition vintage Cadillac with flame paint job. Determined look, knitting needles in cup holder, reading glasses on chain."

generate_image "binary-bob" "$STYLE. A retro chrome robot with antenna and digital display face showing expressions. Sitting in a self-driving car that has its own angry robot face on the hood - they're clearly arguing. Sparks between them, binary code floating around."

# AMATEUR TIER
generate_image "indiana-junior" "$STYLE. A young adventurer in leather jacket and fedora hat, holding a whip. Driving a mud-splattered jeep covered in maps and ropes. Treasure maps stick out everywhere, determined explorer expression, compass swinging from mirror."

generate_image "count-checkpoint" "$STYLE. A dramatic vampire in flowing cape with high collar, pale skin, fangs showing in a grin. Driving a gothic black hearse racer with red interior. Bats fly around, full moon in background, night scene with fog."

generate_image "tiktok-tanya" "$STYLE. A trendy influencer holding a phone with ring light attached to dashboard, taking a selfie while driving a sparkly pink sports car. Perfect makeup, surprised expression, notification hearts floating around her."

generate_image "express-eddie" "$STYLE. A cheerful mailman in blue uniform and cap, driving a souped-up mail truck with racing stripes. Packages and letters fly out behind him. Big friendly smile, mail bag overflowing, eagle logo on door."

generate_image "rock-randy" "$STYLE. A long-haired rocker in leather vest, holding an electric guitar. Driving a hot rod made of amplifiers with flames shooting from exhaust. Headbanging pose, devil horns hand sign, speakers everywhere."

generate_image "whisper-wilson" "$STYLE. A quiet librarian with thick glasses and cardigan, driving a sleek whisper-quiet electric car shaped like a book. Books stacked in back seat, 'SHHH' license plate, peaceful content expression, finger to lips."

generate_image "sherlock-shift" "$STYLE. A detective in deerstalker hat smoking a pipe, holding magnifying glass. Driving a classic British racing green car. Sharp observing eyes, tweed jacket, clue notes pinned everywhere, fog swirling."

generate_image "wave-rider-wes" "$STYLE. A tanned surfer dude with sun-bleached hair, driving a colorful VW bus racer with surfboard strapped to roof. Hang loose hand sign, lei around neck, beach and waves in background, shell necklace."

# ROOKIE TIER
generate_image "taskmaster-tim" "$STYLE. A stressed project manager with loosened tie, driving a sedan completely covered in sticky notes and to-do lists. Multiple monitors mounted on dashboard, coffee cup in hand, overwhelmed but determined expression, Gantt charts visible."

generate_image "caffeinated-carl" "$STYLE. A jittery wide-eyed barista, driving an espresso machine on wheels literally - the car IS a giant espresso machine. Coffee cups everywhere, hands shaking, coffee stains on shirt, steam rising from hood."

generate_image "dating-derek" "$STYLE. A smooth charming man with perfect hair, driving a red sports car filled with rose petals. Winking at viewer, one eyebrow raised, cologne bottle visible, heart-shaped sunglasses, romantic lighting."

generate_image "doctor-dashboard" "$STYLE. A calm doctor in white coat with stethoscope, driving a modified ambulance racer with sirens. Checking pulse while steering, medical charts on clipboard, serene professional expression, red cross on vehicle."

generate_image "fitness-fran" "$STYLE. A buff personal trainer with headband and tank top, driving a truck filled with gym equipment - dumbbells, kettlebells everywhere. Flexing one arm while driving, motivational poster on door, protein shake in cupholder."

generate_image "gamer-gary" "$STYLE. A gamer in a gaming chair mounted on wheels as a vehicle, RGB rainbow lighting everywhere. Gaming headset on, energy drink cans surrounding, determined focused expression, monitor showing racing game."

generate_image "haunted-harry" "$STYLE. A nervous ghost hunter in vest with lots of pockets, driving a vintage hearse filled with EMF equipment and ghostbusting gear. Spooky green fog around, flashlight beam, scared but brave expression, ghost detector beeping."

generate_image "intern-irene" "$STYLE. An eager young intern balancing coffee tray while driving a beat-up company car covered in corporate stickers. Notepad in lap, name badge visible, enthusiastic but overwhelmed smile, 'Will Work for Experience' bumper sticker."

echo ""
echo "🏁 Generation complete!"
