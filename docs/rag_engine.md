# GenRAG Deployment Engine Documentation

## What this does

This is the deployment service for GenRAG. It's a simple FastAPI app that handles deploying and undeploying RAG containers on Azure Container Instances. Think of it as the orchestrator that spins up your RAG systems on demand.

## Setup

You'll need these environment variables:

```bash
AZURE_SUBSCRIPTION_ID=your-subscription-id
PINECONE_API_KEY=your-pinecone-key
OPENAI_API_KEY=your-openai-key
COHERE_API_KEY=your-cohere-key
ACR_USERNAME=your-acr-username
ACR_PASSWORD=your-acr-password
```

The app uses Azure's DefaultAzureCredential for authentication, so make sure you're logged in to Azure CLI or have proper service principal credentials set up.

## Configuration

The deployment uses these settings:

- **Resource Group**: `GenRAG-ResourceGroup`
- **Container Registry**: `genragregistry.azurecr.io`
- **Image**: `genragregistry.azurecr.io/genrag:latest`
- **Location**: `eastus`
- **Port**: `8000`

## How it works

### Container Specs
Each deployed container gets:
- 1 CPU core
- 1 GB RAM
- Public IP address
- All necessary API keys as environment variables

### CORS
Currently allows everything (`origins = ["*"]`) - definitely need to lock this down for production.

## API Endpoints

### GET /
Just a welcome message. Good for health checks.

### POST /deploy
This is where the magic happens. It:

1. Sets up Azure authentication
2. Creates a container configuration with a random UUID in the name
3. Deploys the container group to Azure
4. Waits for deployment to complete
5. Returns the public IP address

The deployment process:
- Pulls the GenRAG image from the Azure Container Registry
- Sets up networking with a public IP
- Injects all the API keys as environment variables
- Waits for the container to be ready

Returns something like:
```json
{
    "status": "Deployment initiated",
    "container_group": "GenRAG-ResourceGroup",
    "state": "deployment_status",
    "public_ip": "20.121.xxx.xxx"
}
```

### GET /undeploy
Takes a container name and deletes the container group. Pretty straightforward cleanup.

Parameters:
- `container_name`: The name of the container group to delete

## Error Handling

Uses Azure's HttpResponseError to catch deployment issues. Returns 500 status codes with the actual Azure error message, which is usually pretty helpful for debugging.

## Notes and TODOs

- CORS is wide open - we will later restric it based on url of our infra
- Some configuration values are hardcoded - We will late move to config files or environment variables
- No authentication on the deployment endpoints - anyone can deploy/undeploy
- The polling mechanism for deployment completion is pretty basic (just sleeps for 5 seconds)
- No cleanup of failed deployments
- No monitoring or logging of container health

## Typical workflow

1. Hit `/deploy` to spin up a new RAG instance
2. Get back the public IP
3. Use that IP to access your RAG API
4. When done, hit `/undeploy` with the container name to clean up

The deployed containers will have the full RAG API available at `http://public_ip:8000` with all the endpoints from the main RAG system.

## Azure Dependencies

Uses these Azure libraries:
- `azure.identity.DefaultAzureCredential` for auth
- `azure.mgmt.containerinstance.ContainerInstanceManagementClient` for container management
- `azure.core.exceptions.HttpResponseError` for error handling

Make sure you have the right Azure permissions for Container Instances in the subscription you're using.