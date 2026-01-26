# Kill dev server processes on specific ports (excludes Docker containers)
$ports = @(3000, 5174, 5175)
$excludedProcesses = @("docker", "dockerd", "com.docker.backend", "com.docker.proxy")

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            # Skip Docker-related processes
            if ($excludedProcesses -contains $process.ProcessName) {
                Write-Host "Skipping Docker process: $($process.ProcessName) (PID: $($process.Id)) on port $port"
                continue
            }

            Write-Host "Killing $($process.ProcessName) (PID: $($process.Id)) on port $port"
            Stop-Process -Id $process.Id -Force
        }
    }
}

Write-Host "Done - dev server ports cleared (3000, 5174, 5175)"
