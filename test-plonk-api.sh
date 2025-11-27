#!/bin/bash
# Test script for Noir/PLONK API endpoints

# Test data from static/input.json
PIXELS='[155,105,106,228,73,79,183,105,69,65,60,162,182,168,71,236,127,44,187,132,52,96,94,107,106,137,121,141,100,96,106,90,135,78,86,122,153,140,87,176,111,69,154,96,134,183,127,53]'
HASH='"1866129108550300590467274657285549123425270937030605505151092292578319287993"'

echo "🧪 Testing Noir/PLONK API endpoints"
echo ""

# Test 1: Generate proof
echo "📜 Test 1: Generating proof..."
echo "POST /api/plonk/proof"
RESPONSE=$(curl -s -X POST http://localhost:5173/api/plonk/proof \
  -H "Content-Type: application/json" \
  -d "{\"pixels\": $PIXELS, \"hash\": $HASH}")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract proof and publicSignals if successful
PROOF=$(echo "$RESPONSE" | jq -r '.data.proof' 2>/dev/null)
PUBLIC_SIGNALS=$(echo "$RESPONSE" | jq -r '.data.publicSignals' 2>/dev/null)

if [ "$PROOF" != "null" ] && [ -n "$PROOF" ]; then
    echo "✅ Proof generated successfully!"
    echo ""
    
    # Test 2: Verify proof
    echo "✔️  Test 2: Verifying proof..."
    echo "POST /api/plonk/verify"
    VERIFY_RESPONSE=$(curl -s -X POST http://localhost:5173/api/plonk/verify \
      -H "Content-Type: application/json" \
      -d "{\"proof\": $PROOF, \"publicSignals\": $PUBLIC_SIGNALS}")
    
    echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
    echo ""
else
    echo "❌ Failed to generate proof. Check the error above."
fi

