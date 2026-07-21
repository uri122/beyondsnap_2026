// 관리자 "사이트 기본정보" 화면에서 편집할 site_settings의 key 목록입니다.
// site_settings는 key-value 구조라 별도 CRUD(추가/삭제) 개념이 없고,
// 여기 정의된 key들을 폼으로 보여주고 값만 수정(upsert)하는 방식으로 관리합니다.
// 새로운 설정 항목이 필요하면 이 배열에 한 줄만 추가하면 관리자 폼에 자동으로 나타납니다.

export type SettingFieldType = "text" | "textarea";

export type SettingField = {
  key: string;
  label: string;
  type: SettingFieldType;
  placeholder?: string;
};

export const SITE_SETTING_FIELDS: SettingField[] = [
  // {
  //   key: "intro_text",
  //   label: "인트로 문구 (메인 첫 화면)",
  //   type: "textarea",
  //   placeholder: "눈부신 오늘의 순간을 기록합니다.",
  // },
  // {
  //   key: "studio_text",
  //   label: "스튜디오 소개 문구",
  //   type: "textarea",
  //   placeholder: "촬영 스타일, 작가 소개 등",
  // },
  {
    key: "sns_instagram",
    label: "인스타그램 URL",
    type: "text",
    placeholder: "https://instagram.com/계정명",
  },
  {
    key: "sns_kakao_channel",
    label: "카카오 채널 URL",
    type: "text",
    placeholder: "https://pf.kakao.com/채널ID",
  },
  {
    key: "sns_naver_blog",
    label: "네이버 블로그 URL",
    type: "text",
    placeholder: "https://blog.naver.com/블로그ID",
  },
];
