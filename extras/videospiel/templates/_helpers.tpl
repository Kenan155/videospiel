{{/*
Anpassungen:
- ServiceAccount wurde entfernt und wird explizit definiert
- Zusaetzliche Labels gemaess Kubescape
*/}}
{{/*
Expand the name of the chart.
*/}}
{{- define "videospiel.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "videospiel.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "videospiel.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels
https://kubernetes.io/docs/reference/labels-annotations-taints
https://helm.sh/docs/chart_best_practices/labels/#standard-labels
https://hub.armosec.io/docs/configuration_parameter_recommendedlabels
*/}}
{{- define "videospiel.labels" -}}
helm.sh/chart: {{ include "videospiel.chart" . }}
{{ include "videospiel.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: microservice
app.kubernetes.io/part-of: acme
{{- end }}

{{/*
Selector labels
*/}}
{{- define "videospiel.selectorLabels" -}}
app: {{ include "videospiel.name" . }}
app.kubernetes.io/name: {{ include "videospiel.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
