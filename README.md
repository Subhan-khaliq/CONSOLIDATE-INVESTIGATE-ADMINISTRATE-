# CIA — Short Audit Summary

All 4 VMs ran CentOS 7 on the same unpatched 2015 kernel. 
All 4 were rooted with the same password (`admin`) found in a plaintext `.creds.txt` on VM1. That one file gave us root on everything.
Additionally VM1 did not even have a password.


---

## Tools We Used

- **nmap**: port scanning, figuring out what was running on each VM
- **curl**: poking at HTTP endpoints, reading headers, hitting APIs
- **gobuster**: brute-forcing directories, mainly on VM1
- **ssh**: logging in with the leaked root password
- **git**: cloning the public repo on VM2
- **searchsploit**: looking up CVEs, found the Gitea RCE (EDB-44996)
- **docker inspect / exec**: reading container ENV variables where all the secrets were
- **Python3**: generating MD5 hashes, brute-forcing the PHP login panel
- **ping sweep, ss, grep, find**: general recon, checking open ports, reading config files
- **crackstation.net + SecLists**: tried cracking MD5 hashes, didn't work
- **hyra**: a tool for parallel password and hash creacking
- **nikto**: nmap and other scans

---

## What Needs to Be Fixed

We need to apply fixes for all the VMs:

- Change/update every credential from `.creds.txt`, they're all compromised
- Set `PermitRootLogin no` and `PasswordAuthentication no` in `sshd_config`
- Delete `.creds.txt` from the repo and wipe it from git history
- Never put passwords in docker-compose ENV blocks, use Docker secrets or Vault
- Run `yum update kernel` because the current one has Dirty COW (CVE-2016-5195), any local user can root the virtual machines
- CentOS 7 is end-of-life which means its will get no further updates and patches since June 2024, start planning a move to Rocky Linux or AlmaLinux

---

## Vulnerabilities

### VM1 (nginx + React + PHP + FTP)

1. **[CRITICAL]** Root password leaked in `.creds.txt` therefore can access root without further exploits.
2. **[CRITICAL]** Kernel 3.10.0-327, and so it is vulnerable to Dirty COW (CVE-2016-5195)
3. **[HIGH]** `userlist.txt` and `README.txt` were publicly readable, one had live MD5-hashed passwords, the other had the default creds and file paths written in it
4. **[HIGH]** nginx 1.16.1 is EOL and leaks its version in every response header
5. **[MEDIUM]** `robots.txt` had a Disallow pointing straight at the hidden PHP app we just went there
6. **[MEDIUM]** proftpd running on port 21, sends credentials in cleartext
7. **[MEDIUM]** VM2's internal IP was hardcoded in the compiled React JS bundle

### VM2 (Gitea 1.4.0)

1. **[CRITICAL]** Same root password, worked via SSH here too
2. **[CRITICAL]** Gitea 1.4.0 has an unauth RCE through the LFS endpoint (CVE-2018-1000003)
3. **[CRITICAL]** Admin password, JWT secret and DB credentials were all sitting in Docker ENV in plaintext
4. **[CRITICAL]** Dirty COW (CVE-2016-5195)
5. **[MEDIUM]** Gitea registration was open, anyone could create an account with no approval
6. **[MEDIUM]** Root SSH password login actually worked even though nmap reported key-only
7. **[MEDIUM]** Containers running as root instead of `service-web`
8. **[LOW]** A repo called `NotAPublicRepo` was publicly cloneable

### VM3 (NagiosXI 5.5.6)

1. **[CRITICAL]** Same root password, third VM in a row
2. **[CRITICAL]** NagiosXI 5.5.6 has RCE, SQLi and auth bypass CVEs (CVE-2019-15949, CVE-2018-15708, CVE-2018-15710/15711)
3. **[CRITICAL]** MySQL root password was literally `root`, exposed in Docker ENV
4. **[CRITICAL]** Dirty COW (CVE-2016-5195)
5. **[HIGH]** MySQL port 3306 was bound to `0.0.0.0` and was reachable from the whole subnet
6. **[HIGH]** Default `nagiosadmin:nagiosadmin` credentials were never changed
7. **[HIGH]** SSH password auth enabled, root login defaulting to yes
8. **[MEDIUM]** NagiosXI container running as `privileged: true` therefore all Linux security features disabled
9. **[LOW]** NagiosXI and MySQL were on separate Docker networks so they couldn't even talk to each other internally

### VM4 (OctoberCMS + Portainer)

1. **[CRITICAL]** Same root password, fourth VM in a row
2. **[CRITICAL]** OctoberCMS 1.0.412 — auth bypass and RCE (CVE-2021-32648, CVE-2022-21705)
3. **[CRITICAL]** DB credentials (`root`/`root`) in Docker ENV
4. **[CRITICAL]** Dirty COW (CVE-2016-5195)
5. **[HIGH]** Portainer 1.23.0 — SSRF and container escape CVEs, mounts the Docker socket read-write so any RCE inside it = root on the host
6. **[HIGH]** PHP 7.1.3 and Apache 2.4.10 are both EOL, exact versions exposed in HTTP headers
7. **[HIGH]** Same SSH misconfiguration as every other VM
8. **[MEDIUM]** Portainer agent port 8000 exposed publicly for no reason
9. **[MEDIUM]** `service-web` user doesn't even exist on this host, containers running as root
10. **[MEDIUM]** `.env` file sitting inside the OctoberCMS web root
