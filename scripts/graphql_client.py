#!/usr/bin/env python3
"""
Base GraphQL client for testing the clubs application
"""

import asyncio
import json
import os
from typing import Any, Dict, Optional

import requests
import websockets
from colorama import Fore, Style, init

# Initialize colorama for colored output
init(autoreset=True)


class GraphQLClient:
    def __init__(self, base_url: str = "http://localhost:4010"):
        self.base_url = base_url
        self.graphql_url = f"{base_url}/graphql"
        self.ws_url = f"ws://localhost:4010/graphql"
        self.token_file = ".token"
        self.token = self._load_token()

    def _load_token(self) -> Optional[str]:
        """Load JWT token from .token file"""
        if os.path.exists(self.token_file):
            with open(self.token_file, "r") as f:
                return f.read().strip()
        return None

    def _save_token(self, token: str):
        """Save JWT token to .token file"""
        with open(self.token_file, "w") as f:
            f.write(token)
        self.token = token
        print(f"{Fore.GREEN}✅ Token saved to {self.token_file}")

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for GraphQL requests"""
        headers = {
            "Content-Type": "application/json",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def query(
        self, query: str, variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a GraphQL query"""
        payload = {"query": query, "variables": variables or {}}

        try:
            response = requests.post(
                self.graphql_url, headers=self._get_headers(), json=payload, timeout=30
            )
            response.raise_for_status()
            result = response.json()

            if "errors" in result:
                print(f"{Fore.RED}❌ GraphQL Errors:")
                for error in result["errors"]:
                    print(f"  {error.get('message', 'Unknown error')}")
                return result

            return result

        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}❌ Request failed: {e}")
            return {"errors": [{"message": str(e)}]}

    def mutation(
        self, mutation: str, variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a GraphQL mutation"""
        return self.query(mutation, variables)

    async def subscription(
        self,
        subscription: str,
        variables: Optional[Dict[str, Any]] = None,
        callback=None,
        duration: int = 10,
    ):
        """Execute a GraphQL subscription"""
        payload = {"query": subscription, "variables": variables or {}}

        try:
            async with websockets.connect(self.ws_url) as websocket:
                # Send connection init
                await websocket.send(
                    json.dumps({"type": "connection_init", "payload": {}})
                )

                # Wait for connection ack
                response = await websocket.recv()
                print(f"{Fore.BLUE}🔌 WebSocket connected")

                # Send subscription
                await websocket.send(
                    json.dumps({"id": "1", "type": "start", "payload": payload})
                )

                print(
                    f"{Fore.YELLOW}📡 Listening for subscription messages for {duration} seconds..."
                )

                # Listen for messages
                start_time = asyncio.get_event_loop().time()
                while (asyncio.get_event_loop().time() - start_time) < duration:
                    try:
                        message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                        data = json.loads(message)

                        if data.get("type") == "data":
                            print(f"{Fore.GREEN}📨 Subscription message received:")
                            print(json.dumps(data.get("payload", {}), indent=2))
                            if callback:
                                callback(data.get("payload", {}))
                        elif data.get("type") == "error":
                            print(f"{Fore.RED}❌ Subscription error: {data}")

                    except asyncio.TimeoutError:
                        continue

                # Close subscription
                await websocket.send(json.dumps({"id": "1", "type": "stop"}))

        except Exception as e:
            print(f"{Fore.RED}❌ Subscription failed: {e}")

    def print_result(self, result: Dict[str, Any], operation_name: str = "Operation"):
        """Pretty print GraphQL result"""
        print(f"\n{Fore.CYAN}🔍 {operation_name} Result:")
        print(f"{Fore.CYAN}{'='*50}")

        if "errors" in result:
            print(f"{Fore.RED}❌ Errors occurred:")
            for error in result["errors"]:
                print(f"  {error.get('message', 'Unknown error')}")
        else:
            print(f"{Fore.GREEN}✅ Success!")
            print(json.dumps(result.get("data", {}), indent=2))

        print(f"{Fore.CYAN}{'='*50}\n")
