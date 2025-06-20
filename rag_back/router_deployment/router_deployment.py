# from fastapi import FastAPI, HTTPException
# from kubernetes import client, config
# from kubernetes.client import V1Pod, V1Container, V1PodSpec, V1EnvVar
# import os
# app = FastAPI()



# # Load the kubeconfig from the environment (this assumes you're running in an environment with access to your Kubernetes cluster)
# # config.load_kube_config()  # This can be omitted if running inside a cluster

# # Define the namespace where your pods will be deployed
# namespace = "default"  # Change this to your target namespace

# @app.post("/deploy_rag")
# async def deploy_rag(image: str):
#     try:
#         # Define environment variables for API keys
#         env_vars = [
#             V1EnvVar(name="PINECONE_API_KEY", value=os.environ.get('PINECONE_API_KEY')),
#             V1EnvVar(name="OPENAI_API_KEY", value=os.environ.get('OPENAI_API_KEY')),
#             V1EnvVar(name="COHERE_API_KEY", value=os.environ.get('COHERE_API_KEY'))
#         ]

#         # Define the container for the pod
#         container = V1Container(
#             name="rag-container",
#             image=image,
#             ports=[client.V1ContainerPort(container_port=80)],  # Expose port 80 (or your custom port)
#             env=env_vars  # Add the environment variables
#         )

#         # Define the pod spec with the container
#         pod_spec = V1PodSpec(containers=[container])

#         # Create a pod object
#         pod = V1Pod(
#             metadata=client.V1ObjectMeta(name="rag-pod"),
#             spec=pod_spec
#         )

#         # Create the pod in the Kubernetes cluster
#         api_instance = client.CoreV1Api()
#         api_instance.create_namespaced_pod(namespace=namespace, body=pod)

#         return {"message": "RAG model deployed successfully", "pod_name": "rag-pod"}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
