
$candidates = @(
    "edu2job-production.up.railway.app",
    "edu2-job-production.up.railway.app",
    "edu2job-production-4b92.up.railway.app"
)

$results = @()

foreach ($domain in $candidates) {
    Write-Host "Testing $domain..."
    $info = @{ Domain = $domain }
    
    # 1. DNS Resolution
    try {
        $dns = Resolve-DnsName -Name $domain -ErrorAction Stop
        $info.IP = $dns.IPAddress
        Write-Host "  DNS: OK ($($dns.IPAddress))"
    } catch {
        $info.IP = "FAIL"
        Write-Host "  DNS: FAIL"
    }

    # 2. TCP Connect (Port 443)
    if ($info.IP -ne "FAIL") {
        try {
            $tcp = Test-NetConnection -ComputerName $domain -Port 443 -InformationLevel Quiet
            $info.TCP = $tcp
            Write-Host "  TCP (443): $tcp"
        } catch {
            $info.TCP = $false
            Write-Host "  TCP (443): FAIL"
        }
    } else {
        $info.TCP = "SKIP"
    }

    # 3. HTTPS Request
    if ($info.TCP -eq $true) {
        try {
            $start = Get-Date
            $response = Invoke-WebRequest -Uri "https://$domain/health/" -TimeoutSec 10 -UseBasicParsing
            $end = Get-Date
            $info.HTTPStatus = $response.StatusCode
            $info.Duration = ($end - $start).TotalMilliseconds
            Write-Host "  HTTPS: OK ($($response.StatusCode))"
        } catch {
            $info.HTTPStatus = $_.Exception.Message
            Write-Host "  HTTPS: FAIL ($_.Exception.Message)"
        }
    } else {
        $info.HTTPStatus = "SKIP"
    }
    
    $results += $info
}

$results | ConvertTo-Json -Depth 2
