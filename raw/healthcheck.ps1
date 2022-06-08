<#===========================================================

        Script: Daily Health Check For Windows Servers
            Owner: Ritwik Das (ritwikdax@gmail.com)
                    Github: devritwik

=============================================================#>



<#===========================================================

{
    "id": 541,
    "hostname": "VMAPPCHN4210",
    "ip": "10.200.1.5",
    "role": "Application Server",
    "owner": "APP-SUPPORT-TEAM@company.com",
    "checkedOn": "06-02-2022 - 11:00 BST",
    "cpu": 4,
    "cpuUtil": 15,
    "ram": "16 GB",
    "ramUtil": 82,
    "uptime": 8,
    "bootTime": "06-06-2022 12:23:00 BST",
    "os": "Windows Server 2016",
    "activated": true,
    "topProcess": ["Open SSH", "SVCHOST"],
    "session": "10 Active Session, 52 Disconnected Session",
    "disks": [
      {
        "deviceID": "C:",
        "volumeName": "New Volume",
        "freeSpace": 1185129424,
        "size": 26945568465
      },
      {
        "deviceID": "D:",
        "volumeName": "New Volume",
        "freeSpace": 1185129424,
        "size": 26945568465
      },
      {
        "deviceID": "D:",
        "volumeName": "New Volume",
        "freeSpace": 1185129424,
        "size": 26945568465
      }

=============================================================#>

<##>

$ScriptPath = Get-Location
$ServerList = Import-CSV "$ScriptPath\Servers.csv" –Header Server, IP, Role, Owner
$ReportFileName = "$ScriptPath\raw-report.json"


# Create output files and nullify display output
New-Item -ItemType file $ReportFileName -Force > $null



$id = 0
$Data = @()


#Main Loop
ForEach ($Server in $ServerList){
$id++

$ServerName = $($Server.Server)
Write-Host "Fetching Report For : $ServerName"

#Properties
try{
    
    $OSDetails = Get-WmiObject win32_operatingSystem -computer $ServerName -ErrorAction Stop
    $Networks = Get-WmiObject Win32_NetworkAdapterConfiguration -computer $ServerName -ErrorAction Stop
    $CPUDetails = Get-WmiObject win32_processor -computer $ServerName -ErrorAction Stop
    $ComSystem = Get-WmiObject Win32_ComputerSystem -computer $ServerName -ErrorAction Stop
    $DiskDetails = Get-WmiObject -Class Win32_LogicalDisk -Filter "DriveType=3" -Computer $ServerName
    $TotalCores = 0
    Get-WMIObject -computername $ServerName -class win32_processor -ErrorAction Stop | ForEach {$TotalCores = $TotalCores + $_.numberofcores}
    $TopProcess = Get-Process -ComputerName $ServerName | Sort-Object CPU -Desc | Select-Object Name,CPU -First 5

    #Calculating Up Time
    $BootTime = [System.Management.ManagementDateTimeconverter]::ToDateTime($OSDetails.lastbootuptime)
    $Now = Get-Date
    $UpTime = New-TimeSpan $BootTime $Now

    #Populating Data
    $ServerData = @{
        id = $id
        status = "ok"
        hostname = $ServerName
        ip = $($Server.IP)
        role = $($Server.Role)
        owner = $($Server.Owner)
        os = $OSDetails.Caption
        checkedOn = Get-Date | Select-Object -ExpandProperty DateTime
        topProcesses = $TopProcess
        cpu = $TotalCores
        cpuUtil = ($CPUDetails | Measure-Object -property LoadPercentage -Average).Average
        domain = $ComSystem.Domain
        ramSize = $OSDetails.TotalVisibleMemorySize
        ramFreeSpace = $OSDetails.FreePhysicalMemory
        ramUtil = (($OSDetails.TotalVisibleMemorySize - $OSDetails.FreePhysicalMemory)/$OSDetails.TotalVisibleMemorySize)*100
        upTime = $UpTime | Select-Object -Property Days, Hours, Minutes, Seconds
        #activated = true
        #sessions = query user /server:$Server
        disksData = $DiskDetails | Select-Object -Property Caption,Size,VolumeName,FreeSpace

    }

    Write-Host "Fetching Report Success - $ServerName"
    

}catch{
    Write-Host "Fetching Report Failed! - $ServerName Communication Error"
    $ServerData = @{
        id = $id
        status = "error"
        hostname = $ServerName
	  ip = $($Server.IP)
        role = $($Server.Role)
        owner = $($Server.Owner)
	  checkedOn = Get-Date | Select-Object -ExpandProperty DateTime


    }

}
$Data+= $ServerData
}



If(Test-Path -Path $ReportFileName )
{
    $Data | ConvertTo-Json -Depth 4 | Add-Content  -Path $ReportFileName
}

