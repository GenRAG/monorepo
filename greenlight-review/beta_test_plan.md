## **1. Project context**

genRAG is a fully customizable Retrieval-Augmented Generation (RAG) platform designed for companies.  
Thanks to a modular block-based system, each organization can build, adapt and maintain its own RAG architecture according to its specific needs.

The platform provides:
- a fully automated deployment system,
- a robust API,
- and an intuitive web interface allowing non-technical users to configure and manage their RAG instances autonomously.

The beta version focuses on the core user flow:
- Guided onboarding to create an initial RAG
- Document management (add / remove / visualize)
- RAG workflow modification after onboarding
- Playground to test the RAG before deployment
- One-click deployment
- Auto-generated graphical interface for end users
- Source transparency in generated answers

---

## **2. User Roles**

The following roles will be involved in beta testing.

| **Role Name** | **Description** |
|--------------|------------------|
| RH Admin | Configures, manages and controls the RAG instances |
| Employee | Uses genRAG to ask questions and retrieve information |

---

## **3. Feature table**

All of the listed features will be demonstrated during the beta presentation.

| **Feature ID** | **User role** | **Feature name** | **Short description** |
|--------------|---------------|------------------|------------------------|
| F1 | Everyone | Login | Users can create an account or log into an existing one |
| F2 | Admin | Onboarding | The admin completes an onboarding flow to generate an initial RAG based on answers |
| F3 | Admin | Edit RAG workflow | The admin can modify the RAG workflow architecture using a no-code system |
| F4 | Admin | Manage documents | The admin can add, remove and visualize documents to refine the RAG scope |
| F5 | Admin | Playground | The admin can test the RAG by asking questions before deployment |
| F6 | Admin | Deploy RAG | The admin can deploy the RAG in one click and track deployment status |
| F7 | Everyone | Ask questions & view sources | Users can ask questions through a Q&A interface and view sources |
| F8 | Admin | Stop or delete RAG | The admin can stop or delete a RAG instance at any time |

---

## **4. Success criteria**

| **Feature ID** | **Key success criteria** | **Indicator / metric** | **Result** |
|--------------|---------------------------|-------------------------|------------|
| F1 | A user can create an account or log in successfully | 10 login/signup attempts, 0 failures | Achieved (10/10) |
| F2 | An admin can complete onboarding and generate an initial RAG | 5 onboarding flows completed, 5 RAGs created | Achieved (5/5) |
| F3 | An admin can modify the RAG workflow without technical knowledge | 10 workflow edits, all saved successfully | Achieved (10/10) |
| F4 | An admin can add, remove and view documents used by the RAG | 15 document actions, 1 indexing delay | Partially achieved (14/15) |
| F5 | An admin can test the RAG before deployment | 30 test questions asked, relevant answers returned | Achieved (30/30) |
| F6 | An admin can deploy the RAG and track its status within 3 minutes | Average deployment time < 3 minutes over 10 tests | Achieved |
| F7 | Users can ask questions and view sources with fast responses | 30 questions, sources displayed, latency < 10s | Achieved |
| F8 | An admin can stop or delete a RAG instance | 5 deletions, 1 delayed shutdown | Partially achieved (4/5) |
