from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from azure.identity import DefaultAzureCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient
from azure.core.exceptions import HttpResponseError
import uuid
import requests

app = FastAPI()

origins = ["*"]  # TODO: Replace with your frontend URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  # TODO: Secure for production

@app.get("/")
async def welcome():
    return {"message": "Welcome to the GenRAG Rag-Engine API"}

@app.post("/deploy")
async def deploy_container():
    # Azure authentication
    credentials = DefaultAzureCredential()

    # Configuration - set these as environment variables
    sub_id = os.getenv("AZURE_SUBSCRIPTION_ID")
    container_group_name = "GenRAG-ResourceGroup"
    resource_group = "GenRAG-ResourceGroup"
    acr_server = "genragregistry.azurecr.io"
    image_name = "genragregistry.azurecr.io/genrag:latest"

    try:
        # Initialize client
        client = ContainerInstanceManagementClient(credentials, sub_id)

        # Container group configuration
        container_group = {
            'location': 'eastus',
            'containers': [{
                'name': f'genrag-container-{uuid.uuid4()}',
                'image': image_name,
                'ports': [{'port': 8000}],
                'resources': {
                    'requests': {
                        'cpu': 1.0,  # Request 1 CPU core
                        'memoryInGB': 1.0  # Request 1 GB of memory
                    }
                },
                'environmentVariables': [
                    {
                        'name': 'PINECONE_API_KEY',
                        'value': os.getenv("PINECONE_API_KEY")
                    },
                    {
                        'name': 'OPENAI_API_KEY',
                        'value': os.getenv("OPENAI_API_KEY")
                    },
                    {
                        'name': 'COHERE_API_KEY',
                        'value': os.getenv("COHERE_API_KEY")
                    }
                ]
            }],
            'os_type': 'Linux',
            'ip_address': {
                'type': 'Public',
                'ports': [{'port': 8000, 'protocol': 'TCP'}]
            },
            'image_registry_credentials': [{
                'server': acr_server,
                'username': os.getenv("ACR_USERNAME"),
                'password': os.getenv("ACR_PASSWORD")
            }]
        }

        # Create container group
        deployment = client.container_groups.begin_create_or_update(
            resource_group,
            container_group_name,
            container_group
        )

        # Wait for deployment completion
        while not deployment.done():
            time.sleep(5)

        container_group_info = client.container_groups.get(resource_group, container_group_name)
        public_ip_address = container_group_info.ip_address.ip

        return {
            "status": "Deployment initiated",
            "container_group": container_group_name,
            "state": deployment.status(),
            "public_ip": public_ip_address
        }

    except HttpResponseError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Azure deployment failed: {str(e)}"
        )

@app.get("/undeploy")
async def undeploy_container(container_name : str):
    # Azure authentication
    credentials = DefaultAzureCredential()

    # Configuration - set these as environment variables
    sub_id = os.getenv("AZURE_SUBSCRIPTION_ID")
    resource_group = "GenRAG-ResourceGroup"

    try:
        # Initialize client
        client = ContainerInstanceManagementClient(credentials, sub_id)

        # Delete container group
        client.container_groups.begin_delete(resource_group, container_name)

        return {"status": "Container group deleted"}

    except HttpResponseError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Azure undeployment failed: {str(e)}"
        )