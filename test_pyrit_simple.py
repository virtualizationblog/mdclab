#!/usr/bin/env python3
"""
Simple PyRIT test to verify Azure OpenAI integration.
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_pyrit_connection():
    """Test PyRIT with Azure OpenAI."""

    print("="*60)
    print("PyRIT Azure OpenAI Integration Test")
    print("="*60)

    try:
        from pyrit.prompt_target import OpenAIChatTarget
        from pyrit.common import initialize_pyrit

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

        # Create target
        print(f"\n🔄 Creating Azure OpenAI target...")
        target = OpenAIChatTarget(
            endpoint=endpoint,
            model_name=deployment,
            api_key=api_key,
            api_version=api_version
        )
        print("✅ Target created")

        # Send test prompt
        print(f"\n🔄 Sending test prompt...")
        from pyrit.orchestrator import PromptSendingOrchestrator

        orchestrator = PromptSendingOrchestrator(objective_target=target)
        response = await orchestrator.send_prompts_async(
            prompt_list=["Hello! Please respond with 'PyRIT connection successful!'"]
        )

        print(f"\n✅ SUCCESS! PyRIT is working with Azure OpenAI")
        print(f"\nResponse:")
        if response:
            print(f"  {response[0]}")
            await orchestrator.print_conversations_async()

        print("\n" + "="*60)
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n" + "="*60)
        return False

if __name__ == "__main__":
    success = asyncio.run(test_pyrit_connection())
    exit(0 if success else 1)
