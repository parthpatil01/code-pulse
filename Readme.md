
# CodePulse

CodePulse is a web-based code execution platform running on AWS that supports multiple programming languages, including JavaScript, Python, and Java. It allows users to write, execute, and manage code files seamlessly, with features like file management, syntax highlighting, and real-time output.

![CodePulse Screenshot](https://imgur.com/1Khk9fz.jpg)

---

## Features

- **Cloud Integration**: Uses AWS services like S3, SQS, and RDS for code storage, execution, and status tracking.
- **Dockerized Execution**: Secure and isolated code execution using Docker containers.
- **Multi-language Support**: Write and execute code in JavaScript, Python, and Java.
- **File Management**: Create, save, import, export, and delete files with ease.
- **Real-time Output**: View execution results in real-time with status updates.
- **Customizable Editor**: Adjust font size, word wrap, and tab size to suit your preferences.
- **Dark Mode**: Toggle between light and dark themes for better readability.

---

## Tech Stack

### Infrastructure
- **AWS**: Core cloud platform for storage, messaging, and compute services.
- **Terraform**: For provisioning AWS resources.
- **Docker**: For secure and isolated code execution.

### Backend
- **Node.js**: For server-side logic.
- **AWS SDK**: For interacting with AWS services (S3, SQS, RDS).
- **MySQL**: For storing submission metadata and statuses.

### Frontend
- **React**: For building the user interface.
- **Monaco Editor**: A powerful code editor for syntax highlighting and editing.
- **Tailwind CSS**: For styling and responsive design.
- **Vite**: For fast development and build processes.

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker** (latest version)
- **AWS Account** with access to S3, SQS, and RDS
- **Terraform** (for infrastructure setup)

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
   # Deploy the Lambda function using Terraform or AWS CLI
   ```

5. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Access the application at `http://ec2-ip`.

---

## Usage

1. **Write Code**: Use the Monaco Editor to write code in your preferred language.
2. **Run Code**: Click the "Run" button to execute the code. The output will appear in the "Output" tab.
3. **Manage Files**: Create, save, import, export, or delete files using the file explorer.
4. **Customize Settings**: Open the settings modal to adjust editor preferences like font size, word wrap, and tab size.

---

## Project Structure

```plaintext
code-pulse/
├── backend/               # Backend Lambda functions
│   ├── check-status/      # Lambda for checking submission status
│   └── submit-code/       # Lambda for submitting code
├── ec2-setup/             # EC2 worker setup for code execution
├── frontend/              # React-based frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── vite.config.js     # Vite configuration
├── terraform/             # Terraform scripts for AWS infrastructure
└── README.md              # Project documentation
```

---

## AWS Architecture

- **S3**: Stores code submissions and execution outputs.
- **SQS**: Manages the queue for code execution requests.
- **RDS**: Stores metadata about submissions and their statuses.
- **Lambda**: Handles code submission and status checking.
- **EC2**: Executes code in Docker containers.
- **Auto Scaling**: Automatically scales EC2 instances based on workload to ensure high availability and performance.
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

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Terraform](https://www.terraform.io/)
