import {type Format} from './Format'
export interface Venue {
    id: number
    slug: string
    name: string
    city: string
    formats: Format[]
}