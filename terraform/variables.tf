variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Default region for regional resources"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Default zone (used for zonal resources)"
  type        = string
  default     = "us-central1-a"
}

variable "network_name" {
  description = "VPC network name"
  type        = string
  default     = "three-tier-net"
}

variable "subnetwork_name" {
  description = "Subnetwork name"
  type        = string
  default     = "three-tier-subnet"
}

variable "ip_cidr_range" {
  description = "Subnet primary IP range"
  type        = string
  default     = "10.10.0.0/16"
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "three-tier-gke"
}

variable "artifact_registry_repo" {
  description = "Artifact Registry repository id"
  type        = string
  default     = "three-tier-repo"
}

variable "node_count" {
  description = "Number of nodes in default pool"
  type        = number
  default     = 2
}

variable "node_machine_type" {
  description = "Machine type for nodes"
  type        = string
  default     = "e2-standard-2"
}


