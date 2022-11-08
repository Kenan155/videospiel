# Aufruf:   .\delete-pvc.ps1

Set-StrictMode -Version Latest

$versionMinimum = [Version]'7.3.0'
$versionCurrent = $PSVersionTable.PSVersion
if ($versionMinimum -gt $versionCurrent) {
    throw "PowerShell $versionMinimum statt $versionCurrent erforderlich"
}

# Titel setzen
$host.ui.RawUI.WindowTitle = 'mysql delete pvc'

$namespace = 'acme'
kubectl delete pvc/mysql-db-volume-mysql-0 --namespace $namespace
kubectl delete pvc/mysql-tmp-volume-mysql-0 --namespace $namespace
kubectl delete pvc/mysql-mysqld-volume-mysql-0 --namespace $namespace
