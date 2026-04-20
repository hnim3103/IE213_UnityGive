FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential curl git ca-certificates pkg-config libssl-dev cmake clang python3 \
    && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain (stable)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /opt

# Clone circom v2 source and build with cargo
RUN git clone --depth 1 --branch v2.1.3 https://github.com/iden3/circom.git circom
WORKDIR /opt/circom
RUN /root/.cargo/bin/cargo build --release --locked || /root/.cargo/bin/cargo build --release

# Install built binary
RUN cp target/release/circom /usr/local/bin/circom || true

WORKDIR /work
ENTRYPOINT ["/bin/bash"]
