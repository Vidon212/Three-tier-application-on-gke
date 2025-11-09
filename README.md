## Three-tier Architecture on GKE

### Architecture diagram

```mermaid
flowchart LR
  Browser((Browser))
  AR[(Artifact Registry)]
  Jenkins[Jenkins Pipeline]

  Browser -->|HTTP/HTTPS| FrontLB[Service: LoadBalancer<br/>frontend]

  subgraph GKE_Cluster
    subgraph three_tier_app["Namespace: three-tier-app"]
      FrontLB --> FE[Deployment: frontend - Nginx]
      FE -->|/api/*| BEsvc[Service: ClusterIP<br/>backend]
      BEsvc --> BE[Deployment: backend - Express]
      BE -->|TCP 5432| PGsvc[Service: ClusterIP<br/>postgres]
      PGsvc --> PG[StatefulSet: postgres<br/>PVC]
    end
  end

  Jenkins -.->|build/push/deploy| AR
```

The browser talks to the public `LoadBalancer` service for the frontend, which serves the static UI and proxies `/api/*` to the backend service. The backend connects to PostgreSQL via the cluster-internal `ClusterIP` service. Jenkins builds and pushes Docker images to Artifact Registry and applies Kubernetes manifests to update deployments.
