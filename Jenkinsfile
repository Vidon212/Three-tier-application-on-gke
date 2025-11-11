pipeline {
  agent any

  parameters {
    string(name: 'GCP_PROJECT', defaultValue: 'your-gcp-project-id', description: 'GCP project ID')
    string(name: 'REGION', defaultValue: 'us-central1', description: 'GCP region (also Artifact Registry location)')
    string(name: 'ZONE', defaultValue: 'us-central1-a', description: 'GCP zone (not used for regional cluster)')
    string(name: 'CLUSTER_NAME', defaultValue: 'three-tier-gke', description: 'GKE cluster name')
    string(name: 'AR_REPO', defaultValue: 'three-tier-repo', description: 'Artifact Registry repository id')
    string(name: 'NAMESPACE', defaultValue: 'three-tier-app', description: 'Kubernetes namespace')
  }

  environment {
    REGISTRY = "${params.REGION}-docker.pkg.dev"
    IMAGE_FRONTEND = "${env.REGISTRY}/${params.GCP_PROJECT}/${params.AR_REPO}/frontend"
    IMAGE_BACKEND  = "${env.REGISTRY}/${params.GCP_PROJECT}/${params.AR_REPO}/backend"
    TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Auth & Configure gcloud') {
      steps {
        withCredentials([file(credentialsId: 'gcp-sa', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
          sh '''
            set -e
            gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
            gcloud config set project "${GCP_PROJECT}"
            gcloud config set compute/region "${REGION}"
            gcloud components install gke-gcloud-auth-plugin --quiet || true
            gcloud auth configure-docker "${REGISTRY}" --quiet
            gcloud container clusters get-credentials "${CLUSTER_NAME}" --region "${REGION}" --project "${GCP_PROJECT}"
          '''
        }
      }
    }

    stage('Build images') {
      steps {
        sh '''
          set -e
          docker build -t "${IMAGE_BACKEND}:${TAG}" backend
          docker build -t "${IMAGE_FRONTEND}:${TAG}" frontend
        '''
      }
    }

    stage('Push images') {
      steps {
        sh '''
          set -e
          docker push "${IMAGE_BACKEND}:${TAG}"
          docker push "${IMAGE_FRONTEND}:${TAG}"
        '''
      }
    }

    stage('Deploy to GKE') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'db-credentials', usernameVariable: 'DB_USER', passwordVariable: 'DB_PASSWORD')]) {
          sh '''
            set -e
            # Namespace
            kubectl apply -f k8s/namespace.yaml
            # Secrets (create or update)
            kubectl -n "${NAMESPACE}" create secret generic db-credentials \
              --from-literal=POSTGRES_USER="${DB_USER}" \
              --from-literal=POSTGRES_PASSWORD="${DB_PASSWORD}" \
              --dry-run=client -o yaml | kubectl apply -f -
            # Postgres
            kubectl -n "${NAMESPACE}" apply -f k8s/postgres/configmap-initdb.yaml
            kubectl -n "${NAMESPACE}" apply -f k8s/postgres/service.yaml
            kubectl -n "${NAMESPACE}" apply -f k8s/postgres/statefulset.yaml
            # Backend
            kubectl -n "${NAMESPACE}" apply -f k8s/backend/service.yaml
            kubectl -n "${NAMESPACE}" apply -f k8s/backend/deployment.yaml
            # Frontend
            kubectl -n "${NAMESPACE}" apply -f k8s/frontend/deployment.yaml
            kubectl -n "${NAMESPACE}" apply -f k8s/frontend/service.yaml
            # Update images to this build tag
            kubectl -n "${NAMESPACE}" set image deployment/backend backend="${IMAGE_BACKEND}:${TAG}"
            kubectl -n "${NAMESPACE}" set image deployment/frontend frontend="${IMAGE_FRONTEND}:${TAG}"
            # Rollout status
            kubectl -n "${NAMESPACE}" rollout status deployment/backend --timeout=180s
            kubectl -n "${NAMESPACE}" rollout status deployment/frontend --timeout=180s
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'kubectl -n "${NAMESPACE}" get svc frontend || true'
    }
  }
}


