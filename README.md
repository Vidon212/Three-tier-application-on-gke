## Three-tier Architecture on GKE

### Architecture diagram

```mermaid
flowchart LR
  Browser((Browser))
  AR[(Artifact Registry)]
  Jenkins[Jenkins Pipeline]

  Browser -->|HTTP/HTTPS| FrontLB[Service: LoadBalancer\nfrontend]

  subgraph "GKE Cluster"
    subgraph "Namespace: three-tier-app"
      FrontLB --> FE[Deployment: frontend (Nginx)]
      FE -->|/api/*| BEsvc[Service: ClusterIP\nbackend]
      BEsvc --> BE[Deployment: backend (Express)]
      BE -->|TCP 5432| PGsvc[Service: ClusterIP\npostgres]
      PGsvc --> PG[(StatefulSet: postgres\nPVC)]
    end
  end

  Jenkins -. build/push/deploy .-> AR
  AR -. image pull .-> FE
  AR -. image pull .-> BE
  Jenkins -. kubectl/apply .-> FE
  Jenkins -. kubectl/apply .-> BE
  Jenkins -. kubectl/apply .-> PG
```

The browser talks to the public `LoadBalancer` service for the frontend, which serves the static UI and proxies `/api/*` to the backend service. The backend connects to PostgreSQL via the cluster-internal `ClusterIP` service. Jenkins builds and pushes Docker images to Artifact Registry and applies Kubernetes manifests to update deployments.


