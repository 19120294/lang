import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { LucideAngularModule, MapPin, Wallet, Stethoscope, ChevronDown, Phone, Globe, BadgeCheck, Clock, AlertTriangle, ExternalLink, Search } from 'lucide-angular';
import { FACILITIES, AREA_LABELS, COST_LABELS, TYPE_LABELS, FacilityArea, FacilityCost, FacilityType, Facility } from '../../core/models/facility.model';
import { FacilitiesApiService } from '../../core/services/facilities-api.service';

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './facilities.component.html',
})
export class FacilitiesComponent implements OnInit {
  private api = inject(FacilitiesApiService);
  readonly MapPin = MapPin; readonly Wallet = Wallet; readonly Stethoscope = Stethoscope;
  readonly ChevronDown = ChevronDown; readonly Phone = Phone; readonly Globe = Globe;
  readonly BadgeCheck = BadgeCheck; readonly Clock = Clock; readonly AlertTriangle = AlertTriangle;
  readonly ExternalLink = ExternalLink; readonly Search = Search;

  readonly AREA_LABELS = AREA_LABELS;
  readonly COST_LABELS = COST_LABELS;
  readonly TYPE_LABELS = TYPE_LABELS;

  readonly areas  = Object.entries(AREA_LABELS) as [FacilityArea, string][];
  readonly costs  = Object.entries(COST_LABELS) as [FacilityCost, string][];
  readonly types  = Object.entries(TYPE_LABELS)  as [FacilityType, string][];

  filterArea = signal<FacilityArea | ''>('');
  filterCost = signal<FacilityCost | ''>('');
  filterType = signal<FacilityType | ''>('');
  query      = signal('');

  /** Nguồn dữ liệu — load từ API, fallback FACILITIES tĩnh khi offline */
  private facilities = signal<Facility[]>(FACILITIES);

  ngOnInit(): void {
    this.api.getAll().subscribe({
      next: list => {
        if (list.length) {
          // Map enum backend (private_pay) → frontend (private)
          const mapped = list.map(f => ({
            ...f,
            cost: f.cost.map(c => (c as string) === 'private_pay' ? 'private' : c) as FacilityCost[],
          }));
          this.facilities.set(mapped);
        }
      },
      error: () => { /* giữ FACILITIES tĩnh khi offline */ },
    });
  }

  readonly filtered = computed(() => {
    const area = this.filterArea();
    const cost = this.filterCost();
    const type = this.filterType();
    const q    = this.query().toLowerCase().trim();
    return this.facilities().filter(f => {
      if (area && f.area !== area) return false;
      if (cost && !f.cost.includes(cost)) return false;
      if (type && !f.type.includes(type)) return false;
      if (q && !f.name.toLowerCase().includes(q) && !f.tags.some(t => t.includes(q))) return false;
      return true;
    });
  });

  onArea(e: Event)  { this.filterArea.set((e.target as HTMLSelectElement).value as FacilityArea | ''); }
  onCost(e: Event)  { this.filterCost.set((e.target as HTMLSelectElement).value as FacilityCost | ''); }
  onType(e: Event)  { this.filterType.set((e.target as HTMLSelectElement).value as FacilityType | ''); }
  onSearch(e: Event){ this.query.set((e.target as HTMLInputElement).value); }
  phoneHref(phone: string): string { return 'tel:' + phone.split(' ').join(''); }

  /** Link Google Maps tạo động từ địa chỉ (hoặc tên cơ sở) */
  mapsLink(f: { name: string; address?: string }): string {
    const q = encodeURIComponent(f.address ? `${f.name}, ${f.address}` : f.name);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  reset()           { this.filterArea.set(''); this.filterCost.set(''); this.filterType.set(''); this.query.set(''); }
}
