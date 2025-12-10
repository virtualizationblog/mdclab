#!/usr/bin/env python3
"""
Direct PyRIT test using the target directly without orchestrator.
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_direct():
    """Test PyRIT target directly."""

    print("="*60)
    print("PyRIT Direct Target Test")
    print("="*60)

    try:
        from pyrit.prompt_target import OpenAIChatTarget
        from pyrit.common import initialize_pyrit
        from pyrit.models import PromptRequestPiece, PromptRequestResponse

        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")

        print(f"\nEndpoint: {endpoint}")
        print(f"Deployment: {deployment}")
        print(f"API Version: {api_version}")

        # Initialize PyRIT
        print("\n🔄 Initializing PyRIT...")
        initialize_pyrit(memory_db_type="InMemory")
        print("✅ PyRIT initialized")

        # Create target - try different configurations
        print(f"\n🔄 Creating Azure OpenAI target...")

        # Configuration 1: Base endpoint
        target = OpenAIChatTarget(
            endpoint=endpoint,
            model_name=deployment,
            api_key=api_key,
            api_version=api_version
        )
        print("✅ Target created")

        # Send test prompt using send_prompt_async directly
        print(f"\n🔄 Sending test prompt directly...")

        # Create a simple prompt request
        request = PromptRequestPiece(
            role="user",
            original_value="Say 'Hello from PyRIT!' if you can read this."
        )

        response = await target.send_prompt_async(prompt_request=request)

        print(f"\n✅ SUCCESS! Got response")
        print(f"\nResponse:")
        print(f"  {response.request_pieces[0].converted_value if response.request_pieces else 'No response'}")

        print("\n" + "="*60)
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n" + "="*60)
        return False

if __name__ == "__main__":
    success = asyncio.run(test_direct())
    exit(0 if success else 1)
