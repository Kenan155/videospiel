{{/*
Anpassungen:
- ServiceAccount wurde entfernt und wird explizit definiert
- Zusaetzliche Labels gemaess Kubescape
*/}}
{{/*
Expand the name of the chart.
*/}}
{{- define "mailserver.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "mailserver.fullname" -}}
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
{{- define "mailserver.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels
https://kubernetes.io/docs/reference/labels-annotations-taints
https://helm.sh/docs/chart_best_practices/labels/#standard-labels
https://hub.armosec.io/docs/configuration_parameter_recommendedlabels
*/}}
{{- define "mailserver.labels" -}}
helm.sh/chart: {{ include "mailserver.chart" . }}
{{ include "mailserver.selectorLabels" . }}
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
{{- define "mailserver.selectorLabels" -}}
app: {{ include "mailserver.name" . }}
app.kubernetes.io/name: {{ include "mailserver.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
