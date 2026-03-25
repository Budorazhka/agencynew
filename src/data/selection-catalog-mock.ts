/**
 * Каталог для мастера подборок: ЖК (первичка) и лоты вторички.
 * В проде заменится API.
 */

export type PrimaryLot = {
  id: string
  label: string
  rooms: number
  area: number
  floor: string
  price: number
  imageUrl: string
  description: string
}

export type PrimaryComplex = {
  id: string
  name: string
  developer: string
  address: string
  lots: PrimaryLot[]
}

export type SecondaryLot = {
  id: string
  propertyId: string
  address: string
  rooms: number
  area: number
  floor: string
  price: number
  imageUrl: string
  description: string
}

export const PRIMARY_COMPLEXES_MOCK: PrimaryComplex[] = [
  {
    id: 'zhk-simvol',
    name: 'ЖК «Символ»',
    developer: 'ГК Крост',
    address: 'Москва, ул. Электрозаводская, 24',
    lots: [
      {
        id: 'sim-518',
        label: 'Корп. 3, кв. 518',
        rooms: 2,
        area: 58.4,
        floor: '12/25',
        price: 18_500_000,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        description:
          'Евродвушка с панорамными окнами на восток, готовая отделка white box. Развитая инфраструктура квартала, паркинг в здании.',
      },
      {
        id: 'sim-201',
        label: 'Корп. 1, кв. 201',
        rooms: 3,
        area: 78.2,
        floor: '7/18',
        price: 24_900_000,
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        description:
          'Трёхкомнатная планировка с кухней-гостиной 25 м², два санузла. Вид во двор, тихий блок.',
      },
    ],
  },
  {
    id: 'zhk-headliner',
    name: 'ЖК «Headliner»',
    developer: 'ПИК',
    address: 'Москва, ул. Шаболовка, 10',
    lots: [
      {
        id: 'hd-302',
        label: 'Секция А, кв. 302',
        rooms: 2,
        area: 61.0,
        floor: '8/18',
        price: 21_200_000,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        description:
          'Студия + спальня, высота потолков 2,85 м. Рядом метро Шаболовская, закрытая территория.',
      },
      {
        id: 'hd-905',
        label: 'Секция Б, кв. 905',
        rooms: 1,
        area: 38.5,
        floor: '15/22',
        price: 14_800_000,
        imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
        description:
          'Однокомнатная с лоджией, отделка «под ключ». Подходит для сдачи или жизни одного-двух человек.',
      },
    ],
  },
  {
    id: 'zhk-level',
    name: 'ЖК «Level Причальный»',
    developer: 'Level Group',
    address: 'Москва, Филёвская набережная',
    lots: [
      {
        id: 'lv-112',
        label: 'Башня 1, кв. 112',
        rooms: 4,
        area: 112.0,
        floor: '22/35',
        price: 45_000_000,
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        description:
          'Четырёхкомнатная на верхних этажах с видом на Москва-реку. Два паркоместа в подарок по акции застройщика.',
      },
    ],
  },
]

export const SECONDARY_LOTS_MOCK: SecondaryLot[] = [
  {
    id: 'sec-1',
    propertyId: 'sec-prop-1',
    address: 'ул. Марксистская, 7, кв. 44',
    rooms: 2,
    area: 52.5,
    floor: '4/9',
    price: 16_200_000,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    description:
      'Кирпичный дом 2010 года, свежий ремонт, встроенная кухня и техника. Развитая транспортная доступность.',
  },
  {
    id: 'sec-2',
    propertyId: 'sec-prop-2',
    address: 'ул. Нижегородская, 32, кв. 18',
    rooms: 3,
    area: 73.2,
    floor: '6/12',
    price: 19_800_000,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    description:
      'Семейная трёшка, два балкона, подземный паркинг во дворе. Школа и детсад в шаговой доступности.',
  },
  {
    id: 'sec-3',
    propertyId: 'sec-prop-3',
    address: '3-й Крутицкий пер., 14, кв. 5',
    rooms: 1,
    area: 36.0,
    floor: '2/5',
    price: 11_400_000,
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    description:
      'Уютная однушка в историческом квартале, высокие потолки 3,2 м. Состояние «заходи и живи».',
  },
  {
    id: 'sec-4',
    propertyId: 'sec-prop-4',
    address: 'ул. Автозаводская, 23, кв. 901',
    rooms: 2,
    area: 64.0,
    floor: '9/14',
    price: 17_500_000,
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    description:
      'Панельный дом после капремонта подъезда, новые лифты. Квартира с изолированными комнатами.',
  },
]
