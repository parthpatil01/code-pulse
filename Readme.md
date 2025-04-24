# CodePulse

CodePulse is a web-based code execution platform running on AWS that supports multiple programming languages, including JavaScript, Python, and Java. It allows users to write, execute, refactor and manage code files seamlessly, with features like file management, syntax highlighting, and real-time output.

![CodePulse Screenshot](https://imgur.com/jc5vdp3.jpg)

---

## Features

- **Cloud-Native Architecture**: Built on AWS, leveraging services like EC2, S3, SQS, RDS, Lambda, API Gateway, and CloudWatch for a scalable and robust platform.
- **Scalable Execution**: Utilizes Docker containers on auto-scaling EC2 instances to handle varying workloads efficiently.
- **Intelligent Code Assistance**: Leverages Retrieval-Augmented Generation (RAG) and OpenAI for intelligent code refactoring suggestions.
- **Knowledge Base**: Employs a vector database (Pinecone) to enhance code understanding and refactoring capabilities.
- **Multi-language Support**: Write and execute code in JavaScript, Python, and Java.
- **File Management**: Create, save, import, export, and delete files with ease.
- **Real-time Output**: View execution results in real-time with status updates.
- **Customizable Editor**: Adjust font size, word wrap, and tab size to suit your preferences.
- **Dark Mode**: Toggle between light and dark themes for better readability.
---

## 🚀 Key Technical Architecture

✅ **Scalable on AWS**: Leverages the power of Amazon Web Services (AWS) with services like EC2, Docker, and Auto Scaling to ensure high availability and the ability to handle increasing user loads.

✅ **Intelligent Refactoring**: Implements Retrieval-Augmented Generation (RAG) combined with OpenAI models to provide intelligent code refactoring suggestions and improvements.

✅ **Vector DB for Knowledge**: Utilizes Pinecone, a vector database, to store and retrieve information relevant to code understanding and refactoring.

✅ **Serverless Workflows**: Employs AWS Lambda functions for efficient and cost-effective backend operations and event-driven workflows.

✅ **Decoupled Async Tasks**: Uses AWS Simple Queue Service (SQS) to decouple components and manage asynchronous code execution tasks reliably.

✅ **Secure Storage**: Ensures the security and durability of code submissions and metadata using AWS Simple Storage Service (S3) and Relational Database Service (RDS).

✅ **Monitoring**: Implements comprehensive monitoring and logging using AWS CloudWatch to track application performance and identify potential issues.

✅ **Managed API**: Provides a secure, scalable, and easily manageable API endpoint using AWS API Gateway.

✅ **Containerized**: Leverages Docker containers to provide isolated and consistent execution environments for user code.

✅ **Infrastructure as Code (IaC)**: Defines and manages the entire AWS infrastructure using Terraform, ensuring consistency and repeatability.

---

## Tech Stack

### Infrastructure
- **AWS**: Core cloud platform providing scalable compute, storage, messaging, and API management services (EC2, S3, SQS, RDS, Lambda, API Gateway, CloudWatch, Auto Scaling).
- **Terraform**: For provisioning and managing AWS infrastructure as code.
- **Docker**: For creating isolated and consistent environments for code execution.

### Backend
- **Node.js**: For server-side logic and handling API requests.
- **AWS SDK**: For seamless interaction with various AWS services (S3, SQS, RDS, Lambda).
- **MySQL**: For storing application metadata and submission statuses.
- **OpenAI**: For integration with intelligent code refactoring features.
- **Pinecone**: As a vector database for storing and querying code embeddings.

### Frontend
- **React**: For building a dynamic and interactive user interface.
- **Monaco Editor**: A powerful code editor component with syntax highlighting and advanced editing features.
- **Tailwind CSS**: A utility-first CSS framework for rapid and responsive styling.
- **Vite**: A fast development server and build tool for modern web applications.

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker** (latest version)
- **AWS Account** with access to S3, SQS, RDS, Lambda, and API Gateway
- **Terraform** (for infrastructure setup)
- **OpenAI API Key**: Required for utilizing intelligent refactoring features.
- **Pinecone API Key**: Required for interacting with the Pinecone vector database.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parthpatil01/code-pulse.git
   cd code-pulse
   ```

2. Set up the infrastructure using Terraform:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

3. Configure environment variables:
   - Create a `.env` file in the `ec2-setup` directory with the following:
     ```env
     AWS_REGION=us-east-1
     S3_BUCKET_NAME=your-s3-bucket-name
     SQS_QUEUE_URL=your-sqs-queue-url
     DB_HOST=your-rds-endpoint
     DB_USER=your-db-username
     DB_PASSWORD=your-db-password
     DB_NAME=your-db-name
     ```

4. Start the backend services:
   ```bash
   cd backend/submit-code
   npm install
   zip -r function-submit.zip .
   # Zip the rest of the lambda files e.g status, refactor
   ```

5. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Access the application at `http://ec2-ip` or `https://api-gateway-url`.

---


## Usage

1. **Write Code**: Use the Monaco Editor to write code in your preferred language.
2. **Run Code**: Click the "Run" button to submit your code for execution. The request is queued using SQS and processed by an EC2 worker in isolated docker environment.
3. **Intelligent Refactoring**: Select code in the editor and trigger the refactoring feature. Suggestions powered by RAG and OpenAI will be displayed.
4. **View Output**: The real-time output and status updates are displayed in the "Output" tab, fetched via the backend API.
5. **Manage Files**: Create, save, import, export, or delete files using the file explorer.
6. **Customize Settings**: Open the settings modal to adjust editor preferences like font size, word wrap, and tab size.
---

## Project Structure

```plaintext
code-pulse/
├── backend/               # Backend Lambda functions
│   ├── check-status/      # Lambda for checking submission status
│   └── Refactor/          # Lambda for intelligent code refactoring
│   └── submit-code/       # Lambda for submitting code
├── ec2-setup/             # EC2 worker setup for code execution
├── frontend/              # React-based frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── vite.config.js     # Vite configuration
├── terraform/             # Terraform scripts for AWS infrastructure
|── vector-store-upload/   # Script to upload to vector db
└── README.md              # Project documentation
```
---
## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## Acknowledgments

  - [Monaco Editor](https://microsoft.github.io/monaco-editor/)
  - [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Terraform](https://www.terraform.io/)
  - [Docker](https://www.docker.com/)
  - [OpenAI](https://openai.com/)
  - [Pinecone](https://www.pinecone.io/)


