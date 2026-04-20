#!/usr/bin/env pwsh
# Build a local circom image and compile the circuit
param(
    [string]$imageName = "local-circom:2.1.3",
    [string]$circuit = "top5_hash.circom"
)

Write-Output "Building Docker image $imageName..."
docker build -t $imageName -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed."
    exit $LASTEXITCODE
}

Write-Output "Running container to compile $circuit..."
docker run --rm -v "${PWD}:/work" -w /work $imageName /bin/bash -lc "/usr/local/bin/circom $circuit --r1cs --wasm --sym --c"
