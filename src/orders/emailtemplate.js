export const getEmailTemplate = (data) => {
  return `
  <!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>유튜브 프리미엄 만료 안내</title>
  </head>

  <body style="margin:0;padding:0;background:#0f0f0f;">
    <!-- Preheader (메일 목록 미리보기 문구) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      유튜브 프리미엄 만료 안내드립니다. 만료일 확인 후 입금 부탁드립니다.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#0f0f0f;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="width:640px;max-width:640px;border-collapse:separate;border-spacing:0;">
            <!-- Header -->
            <tr>
              <td style="padding:0 0 14px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="vertical-align:middle;padding-right:10px;">
                            <!-- YouTube play-ish icon -->
                            <div
                              style="
                                width:44px;height:30px;border-radius:9px;
                                background:#ff0033;
                                box-shadow:0 10px 26px rgba(255,0,51,.35);
                                position:relative;
                              "
                            >
                              <div
                                style="
                                  position:absolute;left:17px;top:7px;
                                  width:0;height:0;border-top:8px solid transparent;
                                  border-bottom:8px solid transparent;border-left:12px solid #ffffff;
                                "
                              ></div>
                            </div>
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:#ffffff;font-weight:700;">
                              YouTube Premium
                            </div>
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#b3b3b3;">
                              만료 안내 • 자동 알림
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>

                    <td align="right" style="padding:0;">
                      <div
                        style="
                          display:inline-block;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:12px;line-height:16px;
                          color:#cfcfcf;
                          padding:6px 10px;
                          border:1px solid rgba(255,255,255,.12);
                          border-radius:999px;
                          background:rgba(255,255,255,.04);
                        "
                      >
                        안내 메일
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td
                style="
                  background:#181818;
                  border:1px solid rgba(255,255,255,.10);
                  border-radius:18px;
                  padding:22px 20px;
                  box-shadow:0 18px 60px rgba(0,0,0,.55);
                "
              >
                <!-- Title -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:#ffffff;font-weight:800;margin:0 0 10px 0;">
                  유튜브 프리미엄 만료 안내
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#d6d6d6;margin:0 0 14px 0;">
                  안녕하세요.<br />
                  유튜브 프리미엄 만료 전 안내 문자/메일 드립니다.
                </div>

                <!-- Info row -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 16px 0;">
                  <tr>
                    <td
                      style="
                        padding:14px 14px;
                        border-radius:14px;
                        background:rgba(255,255,255,.05);
                        border:1px solid rgba(255,255,255,.10);
                      "
                    >
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                        <tr>
                          <td style="padding:0;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#b3b3b3;">
                              만료
                            </div>
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;color:#ffffff;font-weight:800;">
                              <!-- ✅ 여기 값 주입 -->
                              {{expireText}}
                            </div>
                          </td>

                          <td align="right" style="padding:0;">
                            <!-- Status pill -->
                            <div
                              style="
                                display:inline-block;
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:12px;line-height:16px;
                                color:#ffffff;
                                padding:8px 12px;
                                border-radius:999px;
                                background:#ff0033;
                                box-shadow:0 10px 22px rgba(255,0,51,.35);
                                font-weight:700;
                              "
                            >
                              <!-- ✅ 여기 값 주입 -->
                              {{statusText}}
                            </div>
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#b3b3b3;margin-top:6px;">
                              <!-- ✅ 여기 값 주입 -->
                              {{reasonText}}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Payment -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#d6d6d6;margin:0 0 10px 0;">
                  아래 계좌로 입금 부탁드립니다.
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 16px 0;">
                  <tr>
                    <td
                      style="
                        padding:14px 14px;
                        border-radius:14px;
                        background:rgba(255,255,255,.03);
                        border:1px solid rgba(255,255,255,.10);
                      "
                    >
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#b3b3b3;margin-bottom:6px;">
                        입금계좌
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;color:#ffffff;font-weight:900;letter-spacing:.3px;">
                        3333-0600-31134
                      </div>

                      <div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>

                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                        <tr>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#d6d6d6;">
                            <span style="color:#b3b3b3;">입금은행</span> 카카오뱅크
                          </td>
                          <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#d6d6d6;">
                            <span style="color:#b3b3b3;">계좌주</span> 정민우
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Tips -->
                <div
                  style="
                    padding:14px 14px;
                    border-radius:14px;
                    background:rgba(255,255,255,.04);
                    border:1px dashed rgba(255,255,255,.16);
                    margin:0 0 18px 0;
                  "
                >
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d6d6d6;margin:0;">
                    ✅ 입금 시 <b style="color:#ffffff;">본인의 닉네임</b>으로 입금해주시면 확인이 빠릅니다.<br />
                    ✅ <b style="color:#ffffff;">본명</b>으로 입금하실 경우, 입금 후 별도로 알려주시면 감사드리겠습니다.
                  </div>
                </div>

                <!-- CTA -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td
                      style="
                        background:#ff0033;
                        border-radius:12px;
                        box-shadow:0 14px 30px rgba(255,0,51,.30);
                      "
                    >
                      <!-- 버튼 링크는 필요하면 바꿔 -->
                      <a
                        href="{{ctaLink}}"
                        style="
                          display:inline-block;
                          padding:12px 16px;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:14px;line-height:18px;
                          color:#ffffff;
                          text-decoration:none;
                          font-weight:800;
                        "
                      >
                        입금 완료/문의하기 →
                      </a>
                    </td>
                    <td style="padding-left:10px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#b3b3b3;">
                        링크가 없으면 버튼을 제거해도 돼요
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#d6d6d6;">
                  좋은 하루 되세요~^^
                </div>

                <!-- Footer -->
                <div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#8e8e8e;">
                  본 메일은 안내 목적이며, 결제/구독은 사용자 요청에 따라 처리됩니다.<br />
                  © {{year}} Premium Notice
                </div>
              </td>
            </tr>

            <!-- Outer footer -->
            <tr>
              <td align="center" style="padding:14px 8px 0 8px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#8e8e8e;">
                  만약 메일이 잘 보이지 않으면, 메일 앱에서 “원본 보기”로 확인해 주세요.
                </div>
              </td>
            </tr>
          </table>
          <!-- /Container -->
        </td>
      </tr>
    </table>
  </body>
</html>

  `;
}
