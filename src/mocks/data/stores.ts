/**
 * Mock data: Stores
 * Real Korean jewelry store names and locations
 */

export const mockStores = [
  {
    id: 1,
    name: '우동금 강남점',
    region: '서울',
    district: '강남구',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    phone_number: '02-1234-5678',
    business_hours: '평일 10:00-20:00, 주말 10:00-18:00',
  },
  {
    id: 2,
    name: '우동금 홍대점',
    region: '서울',
    district: '마포구',
    address: '서울시 마포구 양화로 456',
    phone: '02-2345-6789',
    phone_number: '02-2345-6789',
    business_hours: '매일 11:00-21:00',
  },
  {
    id: 3,
    name: '우동금 부산 센텀점',
    region: '부산',
    district: '해운대구',
    address: '부산시 해운대구 센텀로 789',
    phone: '051-3456-7890',
    phone_number: '051-3456-7890',
    business_hours: '평일 10:00-20:00, 주말 10:00-19:00',
  },
  {
    id: 4,
    name: '우동금 대구점',
    region: '대구',
    district: '중구',
    address: '대구시 중구 동성로 321',
    phone: '053-4567-8901',
    phone_number: '053-4567-8901',
    business_hours: '매일 10:30-20:30',
  },
  {
    id: 5,
    name: '우동금 인천 송도점',
    region: '인천',
    district: '연수구',
    address: '인천시 연수구 송도국제대로 654',
    phone: '032-5678-9012',
    phone_number: '032-5678-9012',
    business_hours: '평일 10:00-20:00, 주말 10:00-18:00',
  },
];

export const mockRegions = [
  {
    region: '서울',
    districts: ['강남구', '마포구', '중구', '송파구', '서초구'],
  },
  {
    region: '부산',
    districts: ['해운대구', '부산진구', '동래구', '남구'],
  },
  {
    region: '대구',
    districts: ['중구', '동구', '수성구', '달서구'],
  },
  {
    region: '인천',
    districts: ['연수구', '남동구', '부평구', '미추홀구'],
  },
  {
    region: '경기',
    districts: ['수원', '성남', '고양', '용인', '부천'],
  },
];
