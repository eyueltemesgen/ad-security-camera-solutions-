import { useState } from 'react';
import {
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutList,
  Megaphone,
  MessageSquareQuote,
  Navigation,
  Server,
  Share2,
  Wrench,
} from 'lucide-react';
import {
  createAnnouncement,
  createFAQ,
  createGalleryItem,
  createNavItem,
  createService,
  createServiceCategory,
  createSocialLink,
  createTestimonial,
  deleteAnnouncement,
  deleteFAQ,
  deleteGalleryItem,
  deleteNavItem,
  deleteService,
  deleteServiceCategory,
  deleteSocialLink,
  deleteTestimonial,
  fetchAnnouncements,
  fetchFAQs,
  fetchGallery,
  fetchNavigation,
  fetchPages,
  fetchServiceCategories,
  fetchServices,
  fetchSocialLinks,
  fetchTestimonials,
  fetchHomepageSections,
  updateAnnouncement,
  updateFAQ,
  updateGalleryItem,
  updateNavItem,
  updateService,
  updateServiceCategory,
  updateSocialLink,
  updatePage,
  updateTestimonial,
  updateHomepageSection,
} from '../../services/cms';
import { assertSupabase, supabase } from '../../lib/supabase';
import { CmsEntityManager, type CmsEntityConfig } from './CmsEntityManager';

type SectionId =
  | 'services'
  | 'service-cats'
  | 'gallery'
  | 'testimonials'
  | 'faqs'
  | 'nav'
  | 'social'
  | 'pages'
  | 'announcements'
  | 'homepage';

const SECTIONS: { id: SectionId; label: string; icon: typeof Wrench }[] = [
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'service-cats', label: 'Service Categories', icon: Server },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'nav', label: 'Navigation', icon: Navigation },
  { id: 'social', label: 'Social Links', icon: Share2 },
  { id: 'pages', label: 'Pages', icon: LayoutList },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'homepage', label: 'Homepage Sections', icon: LayoutDashboard },
];

export function CmsCatalogTab() {
  const [section, setSection] = useState<SectionId>('services');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-brand-400" /> Content Management
        </h3>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={
              'px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition border border-white/10 ' +
              (section === id ? 'bg-brand-500/20 text-white border-brand-500/40' : 'text-gray-400 hover:text-white')
            }
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        {section === 'services' && <CmsEntityManager config={servicesConfig} />}
        {section === 'service-cats' && <CmsEntityManager config={serviceCategoriesConfig} />}
        {section === 'gallery' && <CmsEntityManager config={galleryConfig} />}
        {section === 'testimonials' && <CmsEntityManager config={testimonialsConfig} />}
        {section === 'faqs' && <CmsEntityManager config={faqsConfig} />}
        {section === 'nav' && <CmsEntityManager config={navConfig} />}
        {section === 'social' && <CmsEntityManager config={socialConfig} />}
        {section === 'pages' && <CmsEntityManager config={pagesConfig} />}
        {section === 'announcements' && <CmsEntityManager config={announcementsConfig} />}
        {section === 'homepage' && <CmsEntityManager config={homepageConfig} />}
      </div>
    </div>
  );
}

const sortOptions = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: `#${i + 1}` }));

const servicesConfig: CmsEntityConfig<any> = {
  label: 'Services',
  singular: 'Service',
  fetch: () => fetchServices(false),
  create: (input) => createService(input as never),
  update: (id, input) => updateService(id, input as never),
  remove: (id) => deleteService(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['name', 'slug', 'description'],
  fields: [
    { key: 'name', label: 'Name', required: true },
    { key: 'slug', label: 'Slug', placeholder: 'auto' },
    { key: 'icon', label: 'Icon', placeholder: 'e.g. cctv, alarm' },
    { key: 'image_url', label: 'Image URL' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'features', label: 'Features', type: 'textarea', placeholder: 'One per line' },
    { key: 'sort_order', label: 'Sort Order', type: 'select', options: sortOptions(8) },
    { key: 'featured', label: 'Featured', type: 'switch' },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const serviceCategoriesConfig: CmsEntityConfig<any> = {
  label: 'Service Categories',
  singular: 'Service Category',
  fetch: () => fetchServiceCategories(),
  create: (input) => createServiceCategory(input as never),
  update: (id, input) => updateServiceCategory(id, input as never),
  remove: (id) => deleteServiceCategory(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['name', 'slug'],
  fields: [
    { key: 'name', label: 'Name', required: true },
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(5) },
  ],
};

const galleryConfig: CmsEntityConfig<any> = {
  label: 'Gallery',
  singular: 'Gallery Item',
  fetch: () => fetchGallery(false),
  create: (input) => createGalleryItem(input as never),
  update: (id, input) => updateGalleryItem(id, input as never),
  remove: (id) => deleteGalleryItem(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['title', 'category'],
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'image_url', label: 'Image URL', required: true },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(8) },
    { key: 'featured', label: 'Featured', type: 'switch' },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const testimonialsConfig: CmsEntityConfig<any> = {
  label: 'Testimonials',
  singular: 'Testimonial',
  fetch: () => fetchTestimonials(false),
  create: (input) => createTestimonial(input as never),
  update: (id, input) => updateTestimonial(id, input as never),
  remove: (id) => deleteTestimonial(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['customer_name', 'company'],
  fields: [
    { key: 'customer_name', label: 'Customer Name', required: true },
    { key: 'company', label: 'Company' },
    { key: 'content', label: 'Testimonial', type: 'textarea', required: true },
    { key: 'rating', label: 'Rating', type: 'select', options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} stars` })) },
    { key: 'image_url', label: 'Photo URL' },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(6) },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const faqsConfig: CmsEntityConfig<any> = {
  label: 'FAQs',
  singular: 'FAQ',
  fetch: () => fetchFAQs(false),
  create: (input) => createFAQ(input as never),
  update: (id, input) => updateFAQ(id, input as never),
  remove: (id) => deleteFAQ(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['question', 'answer'],
  fields: [
    { key: 'question', label: 'Question', required: true, type: 'textarea' },
    { key: 'answer', label: 'Answer', required: true, type: 'textarea' },
    { key: 'category', label: 'Category' },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const navConfig: CmsEntityConfig<any> = {
  label: 'Navigation',
  singular: 'Nav Item',
  fetch: () => fetchNavigation(false),
  create: (input) => createNavItem(input as never),
  update: (id, input) => updateNavItem(id, input as never),
  remove: (id) => deleteNavItem(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['title', 'url'],
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'url', label: 'URL', placeholder: '/products' },
    { key: 'is_external', label: 'External Link', type: 'switch' },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(8) },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const socialConfig: CmsEntityConfig<any> = {
  label: 'Social Links',
  singular: 'Social Link',
  fetch: () => fetchSocialLinks(false),
  create: (input) => createSocialLink(input as never),
  update: (id, input) => updateSocialLink(id, input as never),
  remove: (id) => deleteSocialLink(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['platform', 'username'],
  fields: [
    { key: 'platform', label: 'Platform', required: true, placeholder: 'Facebook, Telegram…' },
    { key: 'username', label: 'Username' },
    { key: 'url', label: 'URL' },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(5) },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const pagesConfig: CmsEntityConfig<any> = {
  label: 'Pages',
  singular: 'Page',
  fetch: () => fetchPages(),
  create: (input) => insertRecord('pages', input),
  update: (id, input) => updatePage(id, input as never),
  remove: () => Promise.resolve(),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['title', 'slug'],
  fields: [
    { key: 'title', label: 'Title', required: true },
    { key: 'slug', label: 'Slug' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'image_url', label: 'Image URL' },
    { key: 'content', label: 'Content', type: 'textarea' },
    { key: 'seo_title', label: 'SEO Title' },
    { key: 'seo_description', label: 'SEO Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ] },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(5) },
  ],
};

const announcementsConfig: CmsEntityConfig<any> = {
  label: 'Announcements',
  singular: 'Announcement',
  fetch: () => fetchAnnouncements(false),
  create: (input) => createAnnouncement(input as never),
  update: (id, input) => updateAnnouncement(id, input as never),
  remove: (id) => deleteAnnouncement(id),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['title', 'message'],
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', type: 'textarea' },
    { key: 'image_url', label: 'Image URL' },
    { key: 'cta_label', label: 'CTA Label' },
    { key: 'cta_url', label: 'CTA URL' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

const homepageConfig: CmsEntityConfig<any> = {
  label: 'Homepage Sections',
  singular: 'Homepage Section',
  fetch: () => fetchHomepageSections(),
  create: (input) => insertRecord('homepage_sections', input),
  update: (id, input) => updateHomepageSection(id, input as never),
  remove: () => Promise.resolve(),
  getValue: (row, key) => (row as Record<string, unknown>)[key],
  searchKeys: ['key', 'title'],
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'key', label: 'Section Key', placeholder: 'hero, services, about…' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'content', label: 'Content', type: 'textarea' },
    { key: 'sort_order', label: 'Sort', type: 'select', options: sortOptions(6) },
    { key: 'is_active', label: 'Active', type: 'switch' },
  ],
};

async function insertRecord(
  table: 'pages' | 'homepage_sections',
  input: Record<string, unknown>
): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from(table).insert(input);
  if (error) throw new Error(error.message);
}