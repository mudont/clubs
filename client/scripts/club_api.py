import logging
from typing import Any, Dict, Optional, Union

import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder

logging.basicConfig(level=logging.INFO)

BASE_URL = "http://localhost:4010"  # Change to your backend URL


class ClubAPI:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.token = None

    def get_login_token(self, username: str, password: str) -> Optional[str]:
        """
        Logs in and stores the JWT token for future requests.
        """
        url = f"{self.base_url}/login"
        payload = {"email": username, "password": password}
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            logging.info("Login successful.")
            return self.token
        else:
            logging.error(f"Login failed: {response.status_code} {response.text}")
            return None

    def _headers(self, extra: Dict[str, str] = None) -> Dict[str, str]:
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        if extra:
            headers.update(extra)
        return headers

    def api_get(self, endpoint: str, params: Dict[str, Any] = None) -> Any:
        url = f"{self.base_url}{endpoint}"
        response = requests.get(url, headers=self._headers(), params=params)
        response.raise_for_status()
        return response.json()

    def api_post(self, endpoint: str, data: Dict[str, Any]) -> Any:
        url = f"{self.base_url}{endpoint}"
        response = requests.post(url, headers=self._headers(), json=data)
        response.raise_for_status()
        return response.json()

    def api_put(self, endpoint: str, data: Dict[str, Any]) -> Any:
        url = f"{self.base_url}{endpoint}"
        response = requests.put(url, headers=self._headers(), json=data)
        response.raise_for_status()
        return response.json()

    def api_delete(self, endpoint: str) -> Any:
        url = f"{self.base_url}{endpoint}"
        response = requests.delete(url, headers=self._headers())
        response.raise_for_status()
        return response.json()

    def graphql(self, query: str, variables: Dict[str, Any] = None) -> Any:
        """
        Perform a GraphQL query or mutation.
        """
        url = f"{self.base_url}/graphql"
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        response = requests.post(
            url,
            headers=self._headers({"Content-Type": "application/json"}),
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            logging.error(f"GraphQL error: {data['errors']}")
            raise Exception(data["errors"])
        return data.get("data")

    def upload_file(
        self,
        endpoint: str,
        file_path: str,
        field_name: str = "file",
        extra_data: Dict[str, Any] = None,
    ) -> Any:
        """
        Upload a file using multipart/form-data.
        """
        url = f"{self.base_url}{endpoint}"
        m_data = {field_name: (file_path, open(file_path, "rb"))}
        if extra_data:
            m_data.update(extra_data)
        m = MultipartEncoder(fields=m_data)
        headers = self._headers({"Content-Type": m.content_type})
        response = requests.post(url, headers=headers, data=m)
        response.raise_for_status()
        return response.json()


# Example usage:
if __name__ == "__main__":
    api = ClubAPI()
    token = api.get_login_token("your_username", "your_password")
    if token:
        # REST example
        profile = api.api_get("/api/users/me")
        print("Profile:", profile)

        # GraphQL example
        query = """
        query GetMe { me { id username email } }
        """
        result = api.graphql(query)
        print("GraphQL result:", result)

        # File upload example (adjust endpoint and file path as needed)
        # upload_result = api.upload_file("/api/upload", "./myfile.txt")
        # print("Upload result:", upload_result)
