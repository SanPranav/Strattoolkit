Write-Host "Starting Tailscale serve processes..." -ForegroundColor Green

# Function to cleanup Tailscale serves
function Stop-TailscaleServes {
    Write-Host "`nStopping Tailscale serves..." -ForegroundColor Yellow
    
    try {
        & tailscale serve --https=3000 off
        Write-Host "Stopped Tailscale serve for port 3000" -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to stop Tailscale serve for port 3000: $_"
    }
    
    try {
        & tailscale serve --https=30090 off
        Write-Host "Stopped Tailscale serve for port 30090" -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to stop Tailscale serve for port 30090: $_"
    }
    
    Write-Host "Cleanup completed." -ForegroundColor Green
}

# Register cleanup function for Ctrl+C (SIGINT)
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Stop-TailscaleServes
}

# Handle Ctrl+C specifically
$null = Register-ObjectEvent -InputObject ([Console]) -EventName CancelKeyPress -Action {
    $Event.SourceEventArgs.Cancel = $true
    Stop-TailscaleServes
    exit 0
}

try {
    # Start Tailscale serves
    Write-Host "Starting Tailscale serve for port 3000..." -ForegroundColor Cyan
    & tailscale serve --bg --https=3000 3000 
    
    Write-Host "Starting Tailscale serve for port 30090..." -ForegroundColor Cyan
    & tailscale serve --bg --https=30090 30090 
    
    Write-Host "`nTailscale serves are running. Press Ctrl+C to stop and cleanup." -ForegroundColor Green
    Write-Host "Services running on:" -ForegroundColor White
    Write-Host "  - Port 3000 (HTTPS)" -ForegroundColor White
    Write-Host "  - Port 30090 (HTTPS)" -ForegroundColor White
    
    # Keep the script running until interrupted
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Error "Error starting Tailscale serves: $_"
    Stop-TailscaleServes
    exit 1
}
finally {
    # Ensure cleanup runs even if script exits unexpectedly
    Stop-TailscaleServes
}