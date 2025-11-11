output "cluster_name" {
  value       = google_container_cluster.cluster.name
  description = "GKE cluster name"
}

output "cluster_location" {
  value       = google_container_cluster.cluster.location
  description = "GKE cluster location (region)"
}

output "artifact_registry_repo" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
  description = "Artifact Registry (Docker) base repo path"
}

output "network" {
  value       = google_compute_network.vpc.name
  description = "VPC network name"
}

output "subnetwork" {
  value       = google_compute_subnetwork.subnet.name
  description = "Subnetwork name"
}


