#!/usr/bin/env python3
"""
Quick test script to validate Azure OpenAI connection.
"""

import os
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

def test_connection():
    """Test Azure OpenAI connection with a simple prompt."""

    print("="*60)
    print("Azure OpenAI Connection Test")
    print("="*60)

    # Get configuration
    # Try base endpoint without /openai/v1
    endpoint_with_path = os.getenv("AZURE_OPENAI_ENDPOINT")
    endpoint = endpoint_with_path.replace("/openai/v1", "").rstrip("/")

    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")

    print(f"\nEndpoint (base): {endpoint}")
    print(f"Endpoint (with path): {endpoint_with_path}")
    print(f"Deployment: {deployment}")
    print(f"API Version: {api_version}")
    print(f"API Key: {'*' * 20}{api_key[-8:] if api_key else 'NOT SET'}")

    if not all([endpoint, deployment, api_key]):
        print("\n❌ ERROR: Missing required environment variables!")
        return False

    try:
        print("\n🔄 Testing connection...")

        # Initialize client
        client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version
        )

        # Send test message
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Connection successful!' if you can read this."}
            ],
            max_completion_tokens=50
        )

        result = response.choices[0].message.content

        print(f"\n✅ SUCCESS! Connection established.")
        print(f"\nResponse from {deployment}:")
        print(f"  {result}")
        print("\n" + "="*60)

        return True

    except Exception as e:
        print(f"\n❌ ERROR: Connection failed!")
        print(f"\nError details: {str(e)}")
        print("\n" + "="*60)
        return False

if __name__ == "__main__":
    success = test_connection()
    exit(0 if success else 1)
