PACK_FILES	=	$(shell find ./host/src/ -type f) \
				./host/installer/wormsec.service	\
				./host/Cargo.toml

PK_FILE		=	./host/install.sh

# This is quite berk, but it'll be changed on the final project

.PHONY: pack
pack: build
	$(eval PACK_FILES += $(shell find ./host/ui/build/ -type f))

	@echo "== Packing file $(PK_FILE)"
	@echo "#!/bin/bash" > $(PK_FILE)
	@echo "if [ \`id -u\` -ne 0 ]; then" >> $(PK_FILE)
	@echo "    echo \"Please run the installer as root !\"" >> $(PK_FILE)
	@echo "    exit 1" >> $(PK_FILE)
	@echo "fi" >> $(PK_FILE)
	@echo >> $(PK_FILE)
	@echo "echo \"Stoping previous install\"" >> $(PK_FILE)
	@echo "systemctl stop wormsec" >> $(PK_FILE)
	@echo "systemctl disable wormsec" >> $(PK_FILE)

	@echo "iptables -P INPUT ACCEPT" >> $(PK_FILE)
	@echo "iptables -P FORWARD ACCEPT" >> $(PK_FILE)
	@echo "iptables -P OUTPUT ACCEPT" >> $(PK_FILE)

	@echo "iptables -t nat -F" >> $(PK_FILE)
	@echo "iptables -t mangle -F" >> $(PK_FILE)
	@echo "iptables -F" >> $(PK_FILE)
	@echo "iptables -X" >> $(PK_FILE)

	@echo "echo \"Installing dependencies\"" >> $(PK_FILE)
	@echo "apt-get update && apt-get install -y curl gcc" >> $(PK_FILE)
	@echo "if ! [ -x "\`command -v cargo\`" ]; then" >> $(PK_FILE)
	@echo "    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y" >> $(PK_FILE)
	@echo "fi" >> $(PK_FILE)

	@echo "---"
	@for file in $(PACK_FILES); do \
		echo "Adding file \"$$file\""; \
		echo "echo \"[+] Extracting file \\\"$$file\\\"\"" >> $(PK_FILE); \
		echo "mkdir -p $$(dirname \"$$file\")\"" >> $(PK_FILE); \
		echo "cat > \"$${file}.b64\" << EOF" >> $(PK_FILE); \
		cat "./$$file" | base64 >> $(PK_FILE); \
		echo "EOF" >> $(PK_FILE); \
		echo "cat \"$${file}.b64\" | base64 -d > \"$$file\"" >> $(PK_FILE); \
		echo "rm \"$${file}.b64\"" >> $(PK_FILE); \
	done
	@echo "---"
	@echo "Adding build sequence"
	@echo "echo \"[+] Building project\"" >> $(PK_FILE)
	@echo "rm -rf /etc/wormsec/" >> $(PK_FILE)
	@echo "mkdir -p /etc/wormsec/" >> $(PK_FILE)
	@echo "cp -r ./host/src/ /etc/wormsec/src/" >> $(PK_FILE)
	@echo "cp -r ./host/ui/ /etc/wormsec/ui/" >> $(PK_FILE)
	@echo "cp ./host/Cargo.toml /etc/wormsec/Cargo.toml" >> $(PK_FILE)
	@echo "cp ./host/installer/wormsec.service /etc/systemd/system/wormsec.service" >> $(PK_FILE)
	@echo "rm -rf ./host/" >> $(PK_FILE)
	@echo "cd /etc/wormsec/" >> $(PK_FILE)
	@echo "/root/.cargo/bin/cargo build --release" >> $(PK_FILE)
	@echo "cp ./target/release/wormsec-poc /etc/wormsec/wormsec" >> $(PK_FILE)
	@echo "/root/.cargo/bin/cargo clean" >> $(PK_FILE)
	@echo "echo \"127.0.0.1\" > /etc/wormsec/ips.txt" >> $(PK_FILE)
	@echo "echo \"Please edit /etc/wormsec/ips.txt\"" >> $(PK_FILE)

	@echo "systemctl daemon-reload" >> $(PK_FILE)
	@echo "systemctl restart wormsec" >> $(PK_FILE)
	@echo "systemctl enable wormsec" >> $(PK_FILE)

	@echo "Adding right to $(PK_FILE)"

	@chown --reference="./host/Dockerfile" "$(PK_FILE)"

	@chmod +x "$(PK_FILE)"

.PHONY: build
build:
	@echo "Building UI"
	@bash -c "cd ./host/ui/ && npm install && npm run build"
