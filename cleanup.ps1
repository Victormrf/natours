# Take ownership of the directory and its contents
$folder = ".\node_modules"
takeown /F $folder /R /D Y

# Grant full permissions
icacls $folder /grant administrators:F /T

# Remove read-only attributes
Get-ChildItem $folder -Recurse | ForEach-Object { $_.Attributes = 'Normal' }

# Remove directory contents
Get-ChildItem -Path $folder -Recurse | Remove-Item -Force -Recurse
Remove-Item $folder -Force -Recurse