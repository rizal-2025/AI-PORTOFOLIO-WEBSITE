param(
    [string]$RemoteUrl,
    [string]$CommitMessage = "Update portfolio website",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Stage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Number,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Host ""
    Write-Host "[$Number/7] $Message" -ForegroundColor Cyan
}

function Invoke-NativeCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [string[]]$CommandArguments = @(),
        [Parameter(Mandatory = $true)]
        [string]$FailureMessage
    )

    & $Command @CommandArguments
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage (exit code $LASTEXITCODE)."
    }
}

function Get-NativeOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [string[]]$CommandArguments = @(),
        [Parameter(Mandatory = $true)]
        [string]$FailureMessage
    )

    $output = @(& $Command @CommandArguments)
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage (exit code $LASTEXITCODE)."
    }

    return $output
}

function Test-SensitivePath {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $false
    }

    $fileName = [System.IO.Path]::GetFileName($Path).ToLowerInvariant()
    if ($fileName -eq ".env.example") {
        return $false
    }

    if ($fileName -in @(
        ".env",
        ".env.local",
        ".env.production",
        "id_rsa",
        "credentials.json",
        "secrets.json"
    )) {
        return $true
    }

    return $fileName.EndsWith(".pem") -or $fileName.EndsWith(".key")
}

function Get-SensitiveRepositoryPaths {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot
    )

    $sensitivePaths = [System.Collections.Generic.HashSet[string]]::new(
        [System.StringComparer]::OrdinalIgnoreCase
    )

    $gitPaths = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @(
            "-c",
            "core.quotepath=false",
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard"
        ) `
        -FailureMessage "Gagal mengambil daftar file tracked dan untracked"

    foreach ($gitPath in $gitPaths) {
        if (Test-SensitivePath -Path $gitPath) {
            [void]$sensitivePaths.Add(($gitPath -replace "\\", "/"))
        }
    }

    # File sensitif yang sudah di-ignore tetap harus terdeteksi. Pemindaian ini
    # hanya memeriksa nama/path dan melewati metadata Git, dependency, dan build.
    $excludedDirectories = [System.Collections.Generic.HashSet[string]]::new(
        [System.StringComparer]::OrdinalIgnoreCase
    )
    foreach ($directoryName in @(
        ".git",
        ".next",
        ".vercel",
        "build",
        "coverage",
        "node_modules",
        "out"
    )) {
        [void]$excludedDirectories.Add($directoryName)
    }

    $directories = [System.Collections.Generic.Stack[System.IO.DirectoryInfo]]::new()
    $directories.Push([System.IO.DirectoryInfo]::new($RepositoryRoot))

    while ($directories.Count -gt 0) {
        $directory = $directories.Pop()

        foreach ($file in $directory.EnumerateFiles()) {
            if (Test-SensitivePath -Path $file.Name) {
                $relativePath = $file.FullName.Substring($RepositoryRoot.Length)
                $relativePath = $relativePath.TrimStart("\", "/") -replace "\\", "/"
                [void]$sensitivePaths.Add($relativePath)
            }
        }

        foreach ($childDirectory in $directory.EnumerateDirectories()) {
            $isReparsePoint = (
                $childDirectory.Attributes -band
                [System.IO.FileAttributes]::ReparsePoint
            ) -ne 0

            if (
                -not $isReparsePoint -and
                -not $excludedDirectories.Contains($childDirectory.Name)
            ) {
                $directories.Push($childDirectory)
            }
        }
    }

    return @($sensitivePaths | Sort-Object)
}

function Assert-NoSensitivePaths {
    param(
        [string[]]$Paths = @(),
        [Parameter(Mandatory = $true)]
        [string]$Context
    )

    $blockedPaths = @(
        $Paths |
            Where-Object { Test-SensitivePath -Path $_ } |
            Sort-Object -Unique
    )

    if ($blockedPaths.Count -gt 0) {
        Write-Host "File sensitif ditemukan pada $Context`:" -ForegroundColor Red
        foreach ($blockedPath in $blockedPaths) {
            Write-Host "  - $blockedPath" -ForegroundColor Red
        }

        throw "Proses dihentikan. Hapus file sensitif dari kandidat backup tanpa membuka isinya."
    }
}

function Test-GitHubRemoteUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    $httpsPattern = "^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?/?$"
    $scpPattern = "^git@github\.com:[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?$"
    $sshPattern = "^ssh://git@github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?/?$"

    return (
        $Url -match $httpsPattern -or
        $Url -match $scpPattern -or
        $Url -match $sshPattern
    )
}

$locationPushed = $false

try {
    if ($null -eq $CommitMessage) {
        throw "Commit message wajib diisi."
    }

    $CommitMessage = $CommitMessage.Trim()
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        throw "Commit message tidak boleh kosong."
    }

    if ($CommitMessage.Length -gt 100) {
        throw "Commit message maksimal 100 karakter."
    }

    if ($CommitMessage.Contains("`r") -or $CommitMessage.Contains("`n")) {
        throw "Commit message harus terdiri dari satu baris."
    }

    $scriptDirectory = Split-Path -Parent $PSCommandPath
    $repositoryRoot = [System.IO.Path]::GetFullPath(
        (Join-Path $scriptDirectory "..")
    ).TrimEnd("\", "/")

    Push-Location -LiteralPath $repositoryRoot
    $locationPushed = $true

    Write-Stage -Number "1" -Message "Memverifikasi repository"

    $requiredPaths = @(
        @{ Name = "package.json"; Type = "Leaf" },
        @{ Name = "app"; Type = "Container" },
        @{ Name = "components"; Type = "Container" },
        @{ Name = "config"; Type = "Container" },
        @{ Name = ".git"; Type = "Container" }
    )

    foreach ($requiredPath in $requiredPaths) {
        $path = Join-Path $repositoryRoot $requiredPath.Name
        if (-not (Test-Path -LiteralPath $path -PathType $requiredPath.Type)) {
            throw "Guard repository gagal: '$($requiredPath.Name)' tidak ditemukan."
        }
    }

    $gitTopLevelOutput = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @("rev-parse", "--show-toplevel") `
        -FailureMessage "Folder ini bukan repository Git yang valid"
    $gitTopLevel = [System.IO.Path]::GetFullPath(
        ($gitTopLevelOutput -join "").Trim()
    ).TrimEnd("\", "/")

    if (
        -not $gitTopLevel.Equals(
            $repositoryRoot,
            [System.StringComparison]::OrdinalIgnoreCase
        )
    ) {
        throw "Guard repository gagal: Git top-level tidak sama dengan root proyek."
    }

    Write-Host "Repository: $repositoryRoot"

    Write-Stage -Number "2" -Message "Memeriksa branch aktif"

    $currentBranchOutput = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @("symbolic-ref", "--quiet", "--short", "HEAD") `
        -FailureMessage "HEAD detached atau branch aktif tidak dapat ditentukan"
    $currentBranch = ($currentBranchOutput -join "").Trim()

    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & git rev-parse --verify HEAD *> $null
    $hasCommit = $LASTEXITCODE -eq 0
    $ErrorActionPreference = $originalErrorActionPreference

    $renameBranchToMain = $false
    if ($hasCommit) {
        if ($currentBranch -ne "main") {
            throw "Repository sudah memiliki commit pada branch '$currentBranch'. Pindah branch dihentikan; gunakan branch 'main' secara manual."
        }

        Write-Host "Branch aktif: main"
    }
    elseif ($currentBranch -ne "main") {
        $renameBranchToMain = $true
        Write-Host "Repository belum memiliki commit dan branch saat ini '$currentBranch'."
        if ($DryRun) {
            Write-Host "Dry run: branch akan diubah menjadi 'main' hanya pada eksekusi nyata setelah konfirmasi."
        }
        else {
            Write-Host "Setelah konfirmasi, branch unborn akan dinamai ulang menjadi 'main'."
        }
    }
    else {
        Write-Host "Branch unborn sudah bernama main."
    }

    Write-Stage -Number "3" -Message "Memeriksa remote GitHub"

    $remoteNames = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @("remote") `
        -FailureMessage "Gagal membaca daftar remote"
    $hasOrigin = @($remoteNames) -contains "origin"
    $originUrl = $null

    if ($hasOrigin) {
        $originOutput = Get-NativeOutput `
            -Command "git" `
            -CommandArguments @("remote", "get-url", "origin") `
            -FailureMessage "Gagal membaca URL remote origin"
        $originUrl = ($originOutput -join "").Trim()

        if (
            -not [string]::IsNullOrWhiteSpace($RemoteUrl) -and
            $RemoteUrl.Trim() -ne $originUrl
        ) {
            throw "RemoteUrl berbeda dari origin yang sudah ada. Script tidak akan mengganti origin."
        }

        Write-Host "Origin sudah ada: $originUrl"
    }
    else {
        if ($DryRun -and [string]::IsNullOrWhiteSpace($RemoteUrl)) {
            Write-Host "Origin belum ada. Dry run tetap dapat dilanjutkan tanpa RemoteUrl."
        }
        else {
            if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
                throw "RemoteUrl wajib diisi karena remote origin belum ada."
            }

            $RemoteUrl = $RemoteUrl.Trim()
            if (-not (Test-GitHubRemoteUrl -Url $RemoteUrl)) {
                throw "RemoteUrl harus berupa URL repository GitHub HTTPS atau SSH yang valid."
            }

            Write-Host "Origin belum ada. URL kandidat: $RemoteUrl"
        }
    }

    Write-Stage -Number "4" -Message "Menjalankan lint, typecheck, dan production build"

    $npmCommand = "npm"
    if (Get-Command "npm.cmd" -ErrorAction SilentlyContinue) {
        $npmCommand = "npm.cmd"
    }

    Write-Host "Menjalankan npm run lint..."
    Invoke-NativeCommand `
        -Command $npmCommand `
        -CommandArguments @("run", "lint") `
        -FailureMessage "Lint gagal; belum ada perubahan Git yang dilakukan"

    Write-Host "Menjalankan npm run typecheck..."
    Invoke-NativeCommand `
        -Command $npmCommand `
        -CommandArguments @("run", "typecheck") `
        -FailureMessage "Typecheck gagal; belum ada perubahan Git yang dilakukan"

    Write-Host "Menjalankan npm run build..."
    Invoke-NativeCommand `
        -Command $npmCommand `
        -CommandArguments @("run", "build") `
        -FailureMessage "Production build gagal; belum ada perubahan Git yang dilakukan"

    Write-Stage -Number "5" -Message "Memeriksa nama file sensitif"

    $sensitiveRepositoryPaths = Get-SensitiveRepositoryPaths `
        -RepositoryRoot $repositoryRoot
    Assert-NoSensitivePaths `
        -Paths $sensitiveRepositoryPaths `
        -Context "repository"
    Write-Host "Tidak ada nama file sensitif yang terdeteksi."

    Write-Stage -Number "6" -Message "Menampilkan status dan menyiapkan commit"

    Invoke-NativeCommand `
        -Command "git" `
        -CommandArguments @("status", "--short") `
        -FailureMessage "Gagal menampilkan status Git"

    if ($DryRun) {
        Write-Stage -Number "7" -Message "Menyelesaikan simulasi"
        Write-Host "DRY RUN selesai. Tidak ada git add, commit, remote, atau push yang dijalankan." -ForegroundColor Green
        return
    }

    $confirmation = Read-Host "Lanjutkan membuat commit dan backup? [y/N]"
    if ($confirmation -notin @("y", "Y")) {
        throw "Proses dibatalkan. Tidak ada git add, commit, remote, atau push yang dijalankan."
    }

    $remoteAdditionApproved = $false
    if (-not $hasOrigin) {
        $remoteConfirmation = Read-Host "Origin belum ada. Tambahkan origin '$RemoteUrl'? [y/N]"
        if ($remoteConfirmation -notin @("y", "Y")) {
            throw "Penambahan origin dibatalkan. Tidak ada git add, commit, remote, atau push yang dijalankan."
        }

        $remoteAdditionApproved = $true
    }

    if ($renameBranchToMain) {
        Write-Host "Mengubah nama branch unborn '$currentBranch' menjadi 'main'..."
        Invoke-NativeCommand `
            -Command "git" `
            -CommandArguments @("branch", "-M", "main") `
            -FailureMessage "Gagal mengubah nama branch menjadi main"
        $currentBranch = "main"
    }

    Invoke-NativeCommand `
        -Command "git" `
        -CommandArguments @("add", "--all") `
        -FailureMessage "git add gagal"

    $stagedPaths = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @(
            "-c",
            "core.quotepath=false",
            "diff",
            "--cached",
            "--name-only",
            "--diff-filter=ACMR"
        ) `
        -FailureMessage "Gagal memeriksa ulang file staged"
    Assert-NoSensitivePaths -Paths $stagedPaths -Context "staging area"

    $stagedNames = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @("diff", "--cached", "--name-only") `
        -FailureMessage "Gagal memeriksa perubahan staged"

    if (@($stagedNames).Count -gt 0) {
        Invoke-NativeCommand `
            -Command "git" `
            -CommandArguments @("commit", "-m", $CommitMessage) `
            -FailureMessage "Commit gagal"
    }
    elseif (-not $hasCommit) {
        throw "Tidak ada perubahan untuk initial commit."
    }
    else {
        Write-Host "Tidak ada perubahan baru; empty commit tidak dibuat."
    }

    Write-Stage -Number "7" -Message "Menyiapkan remote dan mengirim backup"

    if ($remoteAdditionApproved) {
        Invoke-NativeCommand `
            -Command "git" `
            -CommandArguments @("remote", "add", "origin", $RemoteUrl) `
            -FailureMessage "Gagal menambahkan remote origin"
        $originUrl = $RemoteUrl
    }

    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & git rev-parse --abbrev-ref --symbolic-full-name "@{u}" *> $null
    $hasUpstream = $LASTEXITCODE -eq 0
    $ErrorActionPreference = $originalErrorActionPreference

    if ($hasUpstream) {
        & git push
    }
    else {
        & git push -u origin main
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Push gagal. Periksa autentikasi GitHub (Git Credential Manager atau SSH), lalu jalankan kembali script. Script tidak mencoba menyimpan atau mengubah kredensial." -ForegroundColor Yellow
        throw "Backup ke GitHub belum berhasil."
    }

    $shortHashOutput = Get-NativeOutput `
        -Command "git" `
        -CommandArguments @("rev-parse", "--short", "HEAD") `
        -FailureMessage "Push selesai, tetapi hash commit tidak dapat dibaca"
    $shortHash = ($shortHashOutput -join "").Trim()

    if ([string]::IsNullOrWhiteSpace($originUrl)) {
        $originOutput = Get-NativeOutput `
            -Command "git" `
            -CommandArguments @("remote", "get-url", "origin") `
            -FailureMessage "Push selesai, tetapi URL origin tidak dapat dibaca"
        $originUrl = ($originOutput -join "").Trim()
    }

    Write-Host "Backup GitHub berhasil." -ForegroundColor Green
    Write-Host "Branch : main"
    Write-Host "Commit : $shortHash"
    Write-Host "Origin : $originUrl"
}
catch {
    Write-Host ""
    Write-Host "GAGAL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ($locationPushed) {
        Pop-Location
    }
}
