# UnityGive Sequence Diagram - Mô Tả Chi Tiết

## 📋 Tổng Quan Hệ Thống

UnityGive là hệ thống quyên góp từ thiện sử dụng **Multi-Signature (Multi-Sig)** smart contract trên blockchain Ethereum. Hệ thống này cho phép:
- **Donors** gửi tiền ETH cho một chiến dịch từ thiện
- **Organizations** tải lên bằng chứng tác động (Proof of Impact) để yêu cầu phát hành tiền
- **Council Members** biểu quyết phê duyệt phát hành tiền dựa trên bằng chứng
- **Admin** quản lý chiến dịch và hủy nếu cần thiết

---

## 🎯 Bước 1: Đăng Ký Chiến Dịch (Register Campaign)

### Mục đích
Admin tạo một chiến dịch từ thiện mới với các mốc funding (milestones) cụ thể.

### Luồng Chi Tiết

```
Admin -> Contract: registerCampaign(mongoId, orgWallet, goalAmount, councilMembers, requiredVotes, milestoneAmounts, deadline) [onlyAdmin]
```

**Điều kiện & Yêu cầu:**
- Chỉ Admin mới có quyền call function này (modifier `onlyAdmin`)
- Các tham số bắt buộc:
  - `mongoId`: unique ID trong database MongoDB
  - `orgWallet`: địa chỉ ví Ethereum của tổ chức
  - `goalAmount`: tổng tiền cần quyên góp (Wei)
  - `councilMembers[]`: danh sách địa chỉ thành viên hội đồng
  - `requiredVotes`: số phiếu tối thiểu để phê duyệt 1 milestone (VD: 3/5)
  - `milestoneAmounts[]`: mảng số tiền cho từng mốc
  - `deadline`: thời gian hết hạn chiến dịch (Unix timestamp)

**Kiểm Tra Hợp Lệ:**
- goalAmount > 0
- councilMembers.length > 0
- requiredVotes ≤ councilMembers.length
- **Tổng milestoneAmounts phải bằng goalAmount** (rất quan trọng!)
- deadline phải > block.timestamp (trong tương lai)

**Xử Lý Trong Contract:**

```solidity
// Tạo Campaign struct
campaigns[campaignId] = Campaign {
    mongoId: mongoId,
    orgWallet: orgWallet,
    totalGoalAmount: goalAmount,
    currentAmount: 0,                    // Bắt đầu từ 0
    requiredVotes: requiredVotes,
    deadline: deadline,
    isActive: true,                      // Chiến dịch hoạt động
    isSuccessful: false                  // Chưa đạt mục tiêu
}

// Gán thành viên hội đồng
for each member in councilMembers:
    isCouncilMember[campaignId][member] = true

// Khởi tạo Milestones
for each milestone in milestoneAmounts:
    create Milestone {
        amount: milestone amount,
        ipfsEvidence: "",                 // Chưa có bằng chứng
        approvalCount: 0,                 // 0 phiếu
        isApproved: false,                // Chưa phê duyệt
        isFunded: false                   // Chưa phát tiền
    }
```

**Sự Kiện Phát Sinh:**
1. `MilestoneAdded()` - phát nhiều lần, mỗi milestone 1 sự kiện
2. `CampaignRegistered()` - phát 1 lần khi tất cả xong
3. Return `campaignId` để các luồng khác tham chiếu

### Kết Quả
✅ Chiến dịch tạo thành công, sẵn sàng nhận đóng góp

---

## 💰 Bước 2: Luồng Đóng Góp & Xử Lý Tiền Thừa (Donation Flow)

### Mục đích
Donors gửi ETH cho chiến dịch. Nếu vượt mục tiêu, tiền thừa được gửi ngay cho Organization.

### Luồng Chi Tiết

#### **Tình Huống 1: Đóng Góp Bình Thường (Normal Donation)**

```
Donor -> Contract: donate(campaignId) {value: 10 ETH}
Check: isActive = true && now < deadline
Result: 10 ETH được thêm vào currentAmount
```

**Xử Lý:**
```solidity
currentAmount += 10;
donations[campaignId][donor] += 10;    // Lưu để refund nếu cần
emit DonationReceived(campaignId, donor, 10 ETH);
```

#### **Tình Huống 2: Đóng Góp Vượt Mục Tiêu (Excess Donation)**

**Ví Dụ:**
- Goal: 100 ETH
- currentAmount: 95 ETH
- Donor gửi: 10 ETH
- **Vượt mục tiêu: 95 + 10 = 105 ETH > 100 ETH**

**Tính Toán:**
```
- Tiền thừa (excess) = (95 + 10) - 100 = 5 ETH
- Tiền thêm vào campaign (added) = 10 - 5 = 5 ETH
```

**Xử Lý:**
```solidity
// 1. Chỉ thêm 5 ETH vào campaign (để không vượt goal)
currentAmount += 5;                    // 95 + 5 = 100
donations[campaignId][donor] += 5;     // Donor được ghi nhận 5 ETH

// 2. Gửi ngay 5 ETH cho Organization
orgWallet.call{value: 5 ETH}("");      // Low-level call, an toàn hơn transfer()

// 3. Phát sự kiện với số tiền thêm (không phải toàn bộ)
emit DonationReceived(campaignId, donor, 5 ETH);
```

**Lý Do Xử Lý Tiền Thừa Ngay:**
- Tránh tích lũy tiền không cần thiết trong contract
- Cho phép Organization có tiền sớm hơn
- Đơn giản hóa luận lý refund (chỉ refund donations[...])

**Điều Kiện Cuộc Gọi:**
- `isActive == true`: Chiến dịch phải còn hoạt động
- `now <= deadline`: Chưa hết hạn
- `msg.value > 0`: Phải gửi ít nhất 1 Wei

### Kết Quả
✅ Tiền được ghi nhận, tiền thừa gửi cho Org, Donor có quyền refund nếu hủy

---

## 👁️ Bước 3: Bằng Chứng & Phê Duyệt Multi-Sig (Milestone Proof & Multi-Sig Approval)

### Mục đích
Organization chứng minh họ đã làm công việc, Council biểu quyết phê duyệt phát tiền.

### Phần A: Tải Lên Bằng Chứng (Upload Proof of Impact)

```
Org -> Contract: uploadProofOfImpact(campaignId, milestoneIndex, ipfsCID) [onlyOrganization]
```

**Điều Kiện:**
- Chỉ Organization của chiến dịch này mới được gọi
- milestoneIndex phải hợp lệ (0 ≤ index < totalMilestones)
- Milestone chưa được phê duyệt (`!isApproved`)
- ipfsCID không được trống (bằng chứng trên IPFS)

**Xử Lý:**
```solidity
Milestone storage m = campaignMilestones[campaignId][milestoneIndex];
m.ipfsEvidence = ipfsCID;              // Lưu hash IPFS
emit ProofUploaded(campaignId, milestoneIndex, ipfsCID);
```

**Ý Nghĩa:**
- Organization upload video/hình/báo cáo lên IPFS
- Lấy hash IPFS (VD: `QmXxxx...`) rồi lưu vào contract
- Đây là bằng chứng tác động (Impact proof), Council sẽ xem trước khi vote

### Phần B: Phiếu Bầu Multi-Sig (Multi-Sig Voting)

#### **Vòng 1: Council Member Thứ Nhất Bầu Phê Duyệt**

```
Council Member #1 -> Contract: voteApproveMilestone(campaignId, milestoneIndex) [onlyCouncilMember]
```

**Kiểm Tra:**
- Là thành viên Council của chiến dịch này không?
- Proof đã upload chưa? (ipfsEvidence != "")
- Chưa phê duyệt trước đó không? (!isApproved)
- Thành viên này chưa vote milestone này không?

**Xử Lý:**
```solidity
Milestone storage m = campaignMilestones[campaignId][milestoneIndex];

// 1. Đánh dấu đã biểu quyết (hasVoted[campaignId][milestoneIndex][caller] = true)
// 2. Tăng số phiếu
m.approvalCount += 1;                  // approvalCount = 1

// 3. Phát sự kiện
emit Voted(campaignId, milestoneIndex, caller);

// 4. Kiểm tra có đạt ngưỡng không?
if (m.approvalCount >= requiredVotes) {
    // Có! Chuyển sang phần C
}
```

#### **Vòng 2 & 3: Thành Viên Khác Bầu**

Quy trình lặp lại với Council Member #2, #3...

Khi: **approvalCount ≥ requiredVotes** (VD: 3 phiếu >= 3 phiếu yêu cầu)

### Phần C: Phê Duyệt & Phát Hành Tiền (Approval & Fund Release)

#### **Tình Huống 1: Đủ Tiền (Sufficient Balance)**

**Điều Kiện:**
- `approvalCount >= requiredVotes` ✓
- `currentAmount >= milestone.amount` ✓

**Xử Lý:**
```solidity
// 1. Đánh dấu milestone
m.isApproved = true;                   // Phê duyệt
m.isFunded = true;                     // Đánh dấu sẽ/đã phát tiền
emit MilestoneApproved(campaignId, milestoneIndex);

// 2. Tính toán & phát tiền
uint256 releaseAmount = m.amount;      // VD: 25 ETH
currentAmount -= releaseAmount;        // 100 - 25 = 75 ETH
orgWallet.call{value: releaseAmount}("");

// 3. Phát sự kiện
emit FundsReleased(campaignId, milestoneIndex, orgWallet, 25 ETH);
```

**Kết Quả:**
✅ Tiền được chuyển ngay cho Organization

#### **Tình Huống 2: Không Đủ Tiền (Insufficient Balance - PENDING STATE)**

**Ví Dụ Thực Tế:**
- Campaign cần: 100 ETH (3 milestones x 33 ETH mỗi cái)
- Hiện có: 25 ETH (chỉ 1 milestone)
- Milestone #1 được phê duyệt nhưng cần 33 ETH
- 25 < 33: **Không đủ tiền**

**Xử Lý:**
```solidity
// 1. Phê duyệt milestone nhưng KHÔNG phát tiền
m.isApproved = true;                   // Đã phê duyệt
m.isFunded = false;                    // Chưa phát tiền (PENDING)
emit MilestoneApproved(campaignId, milestoneIndex);

// Không emit FundsReleased vì chưa phát
```

**Trạng Thái PENDING Này Sẽ:**
- Chạy lại khi có đóng góp mới (Bước 2 của Donor khác)
- Hoặc chạy lại khi topUp (Bước 4)
- Khi nào currentAmount >= all pending milestones thì mới phát

**Cơ Chế Tái Xử Lý:**
Để tái xử lý pending milestones, cần thêm logic trong `donate()` hoặc `topUpCampaign()`:
```solidity
// Sau khi currentAmount tăng, kiểm tra milestones pending
for (uint i = 0; i < campaignMilestones[campaignId].length; i++) {
    Milestone storage m = campaignMilestones[campaignId][i];
    if (m.isApproved && !m.isFunded && currentAmount >= m.amount) {
        // Phát tiền cho milestone pending này
        m.isFunded = true;
        currentAmount -= m.amount;
        emit FundsReleased(...);
    }
}
```

---

## ⏰ Bước 4: Sau Hạn - Top-up Chiến Dịch (After Deadline - Top-up)

### Mục đích
Nếu hết hạn mà chưa đạt mục tiêu, Organization có thể "top-up" (gửi thêm tiền của mình) để hoàn thành.

### Điều Kiện Gọi

```
block.timestamp > deadline && currentAmount < totalGoalAmount
```

**Ví Dụ:**
- Deadline: 2024-04-01 (đã qua)
- Goal: 100 ETH
- Hiện có: 60 ETH
- Organization muốn hoàn thành: gọi topUpCampaign()

### Luồng Chi Tiết

```
Org -> Contract: topUpCampaign(campaignId) {value: 40 ETH} [onlyOrganization]
```

**Kiểm Tra:**
1. Chỉ Organization của chiến dịch này
2. `block.timestamp > deadline` (đã hết hạn)
3. `currentAmount < totalGoalAmount` (chưa đạt mục tiêu)

**Tính Toán:**
```solidity
needed = totalGoalAmount - currentAmount;  // 100 - 60 = 40 ETH

require(msg.value >= needed);              // Organization phải gửi ≥ 40 ETH

excess = msg.value - needed;               // Nếu gửi 45 ETH: excess = 5 ETH
```

**Xử Lý:**
```solidity
// 1. Cập nhật campaign
currentAmount = totalGoalAmount;           // 60 + 40 = 100 (đạt mục tiêu)
isSuccessful = true;                       // Đánh dấu thành công

// 2. Ghi nhận top-up như donation
emit DonationReceived(campaignId, Org, needed);

// 3. Nếu gửi quá, trả lại cho Organization
if (excess > 0) {
    orgWallet.call{value: excess}("");
}
```

**Tác Dụng:**
- ✅ Chiến dịch đạt mục tiêu, có thể phát hành milestones pending
- ✅ Organization có thể hoàn thành chiến dịch nếu đóng góp không đủ

---

## 🚫 Bước 5: Hủy Chiến Dịch & Hoàn Tiền (Cancel Campaign & Refund)

### Phần A: Admin Hủy Chiến Dịch

```
Admin -> Contract: cancelCampaign(campaignId) [onlyAdmin]
```

**Điều Kiện:**
- Chỉ Admin gọi được
- Chiến dịch phải đang active

**Xử Lý:**
```solidity
campaigns[campaignId].isActive = false;
emit CampaignCancelled(campaignId);
```

**Kết Quả:**
- ✅ Đóng chiến dịch
- ✅ Donors có thể bắt đầu refund
- ⚠️ Organization không thể upload proof nữa
- ⚠️ Council không thể vote nữa

### Phần B: Donors Hoàn Tiền

```
Donor -> Contract: refund(campaignId) [nonReentrant]
```

**Điều Kiện:**
- Campaign phải không active (`!isActive`)
- Donor phải có tiền đã đóng (`donations[donor] > 0`)

**Xử Lý:**
```solidity
uint256 amount = donations[campaignId][donor];  // VD: 5 ETH
require(amount > 0);                             // Phải có tiền

// 1. Đặt lại donations thành 0 (ngăn double-spend)
donations[campaignId][donor] = 0;

// 2. Cộng lại vào currentAmount (vì khi donate đã trừ)
if (currentAmount >= amount) {
    currentAmount -= amount;
}

// 3. Phát tiền cho Donor
payable(donor).call{value: amount}("");

// 4. Sự kiện
emit RefundIssued(campaignId, donor, amount);
```

**Modifier `nonReentrant`:**
- Bảo vệ chống tấn công reentrancy
- Đảm bảo mỗi refund xử lý 1 lần

---

## 📊 Bảng Tóm Tắt Trạng Thái Campaign

| Trạng Thái | isActive | isSuccessful | Cho Phép |
|-----------|----------|-------------|---------|
| Mới tạo | `true` | `false` | Donate, Vote, Upload Proof |
| Đạt mục tiêu | `true` | `true` | Donate, Vote, Upload Proof |
| Hết hạn, chưa đủ | `true` | `false` | Donate, Top-up, Vote |
| Đã hủy | `false` | `false` | Refund |

---

## 🔐 Các Modifier & Bảo Mật

### Access Control
```solidity
modifier onlyAdmin()                 // Chỉ Platform Admin
modifier onlyOrganization()          // Chỉ tổ chức chiến dịch
modifier onlyCouncilMember()         // Chỉ thành viên hội đồng chiến dịch này
```

### State Protection
```solidity
modifier campaignExists()            // Campaign phải tồn tại
modifier campaignIsActive()          // Campaign phải đang hoạt động
modifier campaignNotExpired()        // Campaign chưa hết hạn
modifier nonReentrant()              // Chống reentrancy attack
```

---

## 💡 Trường Hợp Đặc Biệt

### 1️⃣ Milestone Được Approve Nhưng Tiền Không Đủ
**Tình Huống:** 
- Milestone #1 cần 30 ETH, hiện có 20 ETH
- Council vote approve rồi
- Rồi một Donor khác đóng 15 ETH (tổng 35 ETH)

**Kết Quả:**
- Milestone #1 sẽ được tự động phát tiền cho Organization
- (Cần implement logic trigger lại trong donate() hoặc có separate helper function)

### 2️⃣ Hủy Giữa Đường, Một Số Milestone Đã Phát Tiền
**Tình Huống:**
- Milestone #1: đã phát 25 ETH
- Milestone #2: pending, chưa phát
- Admin hủy campaign

**Refund Logic:**
```
Donor A đóng: 40 ETH
- Nếu Donation A được dùng cho Milestone #1 => Không refund được phần đó
- (Contract không track per-milestone, chỉ track tổng donations[...])
```

⚠️ **Lưu ý:** Refund chỉ refund những tiền còn trong contract currentAmount. Nếu đã phát cho Org thì không refund được.

### 3️⃣ Donation Vượt Mục Tiêu Trong Lần Đầu
**Ví Dụ:**
- Goal: 100 ETH
- currentAmount: 0
- Donor gửi: 150 ETH

**Xử Lý:**
- Thêm: 100 ETH vào campaign
- Excess: 50 ETH gửi ngay cho Org
- Donation ghi nhận: 100 ETH

---

## 🎬 Luồng Thực Tế Hoàn Chỉnh

```
1. Admin tạo Campaign với 3 Milestones (30, 35, 35 ETH)
2. Donor A gửi 50 ETH → campaign có 50 ETH (30 gửi cho Org)
3. Org upload bằng chứng Milestone #1
4. Council vote (3 thành viên) → approve Milestone #1 & phát 30 ETH cho Org
5. Donor B gửi 40 ETH → campaign có 60 ETH (5 gửi cho Org vì vượt 100)
6. Org upload bằng chứng Milestone #2
7. Council vote → approve & phát 35 ETH cho Org (còn 25 ETH)
8. Org top-up 10 ETH sau deadline → campaign = 35 ETH
9. Org upload bằng chứng Milestone #3
10. Council vote → approve & phát 35 ETH nhưng không đủ (chỉ có 35, cần 35)
    → Phát được cho Org, currentAmount = 0
11. Campaign complete! ✓
```

---

## 📝 Tổng Kết

UnityGive hoạt động dựa trên **trust + transparency**:
- **Donors** tin tưởng tiền sẽ được phát nếu Council phê duyệt
- **Council** xem bằng chứng trước khi vote
- **Organization** phải chứng minh công việc qua Proof of Impact
- **Admin** có quyền hủy nếu phát hiện gian lận

Smart contract đảm bảo **tất cả điều kiện được kiểm tra tự động**, không ai có thể thao túng.

---

**Created:** March 2026
**Phiên bản:** 1.0 - Chi tiết đầy đủ
