import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavLink {
  id: string;
  title: string;
  url: string | null;
  link_type: 'external' | 'internal' | 'modal';
  internal_route: string | null;
  modal_type: string | null;
  button_style: string;
  display_order: number;
  is_active: boolean;
}

interface NavigationLinksProps {
  branchId: number;
}

function SortableItem({ link, editingId, onEdit, onUpdate, onDelete, onToggleActive, setLinks, links }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-2xl p-4 ${
        !link.is_active ? 'opacity-50' : ''
      }`}
    >
      {editingId === link.id ? (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">Tiêu đề</label>
            <input
              type="text"
              value={link.title}
              onChange={(e) => setLinks(links.map((l: NavLink) => l.id === link.id ? { ...l, title: e.target.value } : l))}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">Loại nút</label>
            <select
              value={link.link_type}
              onChange={(e) => setLinks(links.map((l: NavLink) => l.id === link.id ? { ...l, link_type: e.target.value as any } : l))}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
            >
              <option value="external">Link ngoài</option>
              <option value="internal">Link nội bộ</option>
              <option value="modal">Mở popup</option>
            </select>
          </div>

          {link.link_type === 'external' && (
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">URL</label>
              <input
                type="text"
                value={link.url || ''}
                onChange={(e) => setLinks(links.map((l: NavLink) => l.id === link.id ? { ...l, url: e.target.value } : l))}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          )}

          {link.link_type === 'internal' && (
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Route</label>
              <input
                type="text"
                value={link.internal_route || ''}
                onChange={(e) => setLinks(links.map((l: NavLink) => l.id === link.id ? { ...l, internal_route: e.target.value } : l))}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="/gallery"
              />
            </div>
          )}

          {link.link_type === 'modal' && (
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Loại popup</label>
              <select
                value={link.modal_type || ''}
                onChange={(e) => setLinks(links.map((l: NavLink) => l.id === link.id ? { ...l, modal_type: e.target.value } : l))}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
              >
                <option value="">Chọn loại popup</option>
                <option value="menu">Menu (Thực đơn)</option>
                <option value="space">Space (Không gian quán)</option>
                <option value="contact">Contact (Liên hệ)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">Kiểu nút</label>
            <select
              value={link.button_style}
              onChange={(e) => setLinks(links.map((l: NavLink) => l.id === link.id ? { ...l, button_style: e.target.value } : l))}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
            >
              <option value="default">Mặc định</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(link.id)}
              className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-300 text-green-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Lưu
            </button>
            <button
              onClick={() => onEdit(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all cursor-grab active:cursor-grabbing"
            >
              <i className="ri-draggable"></i>
            </button>
            <div className="flex-1">
              <h3 className="text-gray-900 font-bold">{link.title}</h3>
              <p className="text-gray-600 text-sm font-medium">
                {link.link_type === 'external' && link.url}
                {link.link_type === 'internal' && link.internal_route}
                {link.link_type === 'modal' && `Popup: ${link.modal_type}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleActive(link.id, link.is_active)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                link.is_active 
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <i className={link.is_active ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
            </button>
            <button
              onClick={() => onEdit(link.id)}
              className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg transition-all cursor-pointer"
            >
              <i className="ri-edit-line"></i>
            </button>
            <button
              onClick={() => onDelete(link.id)}
              className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg transition-all cursor-pointer"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavigationLinks({ branchId }: NavigationLinksProps) {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    link_type: 'external' as 'external' | 'internal' | 'modal',
    internal_route: '',
    modal_type: '',
    button_style: 'default',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (branchId) {
      loadLinks();
    }
  }, [branchId]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .eq('branch_id', branchId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Update display_order in database
      try {
        const updates = newLinks.map((link, index) => ({
          id: link.id,
          display_order: index + 1,
        }));

        for (const update of updates) {
          await supabase
            .from('navigation_links')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        setMessage({ type: 'success', text: 'Đã cập nhật thứ tự!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      } catch (error: any) {
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật thứ tự' });
        loadLinks(); // Reload to restore original order
      }
    }
  };

  const handleAdd = async () => {
    try {
      const maxOrder = Math.max(...links.map(l => l.display_order), 0);
      
      const { error } = await supabase
        .from('navigation_links')
        .insert({
          ...formData,
          branch_id: branchId,
          display_order: maxOrder + 1,
          is_active: true,
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Thêm nút thành công!' });
      setShowAddForm(false);
      resetForm();
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const link = links.find(l => l.id === id);
      if (!link) return;

      const { error } = await supabase
        .from('navigation_links')
        .update({
          title: link.title,
          url: link.url,
          link_type: link.link_type,
          internal_route: link.internal_route,
          modal_type: link.modal_type,
          button_style: link.button_style,
        })
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      setEditingId(null);
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nút này?')) return;

    try {
      const { error } = await supabase
        .from('navigation_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Xóa thành công!' });
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('navigation_links')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      link_type: 'external',
      internal_route: '',
      modal_type: '',
      button_style: 'default',
    });
  };

  if (loading) {
    return <div className="text-white text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý nút</h2>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            <i className="ri-information-line mr-1 w-4 h-4 inline-flex items-center justify-center"></i>
            Kéo thả để sắp xếp lại thứ tự các nút
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
          Thêm nút mới
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-300 text-green-800 font-semibold' 
            : 'bg-red-50 border border-red-300 text-red-800 font-semibold'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Thêm nút mới</h3>
          
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
              placeholder="VD: XEM MENU"
            />
          </div>

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">Loại nút</label>
            <select
              value={formData.link_type}
              onChange={(e) => setFormData({ ...formData, link_type: e.target.value as any })}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
            >
              <option value="external">Link ngoài</option>
              <option value="internal">Link nội bộ</option>
              <option value="modal">Mở popup</option>
            </select>
          </div>

          {formData.link_type === 'external' && (
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          )}

          {formData.link_type === 'internal' && (
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Route</label>
              <input
                type="text"
                value={formData.internal_route}
                onChange={(e) => setFormData({ ...formData, internal_route: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="/gallery"
              />
            </div>
          )}

          {formData.link_type === 'modal' && (
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Loại popup</label>
              <select
                value={formData.modal_type}
                onChange={(e) => setFormData({ ...formData, modal_type: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
              >
                <option value="">Chọn loại popup</option>
                <option value="menu">Menu (Thực đơn)</option>
                <option value="space">Space (Không gian quán)</option>
                <option value="contact">Contact (Liên hệ)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">Kiểu nút</label>
            <select
              value={formData.button_style}
              onChange={(e) => setFormData({ ...formData, button_style: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
            >
              <option value="default">Mặc định</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAdd}
              className="flex-1 py-3 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl transition-all cursor-pointer whitespace-nowrap"
            >
              Thêm
            </button>
            <button
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Links List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map(link => link.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {links.map((link) => (
              <SortableItem
                key={link.id}
                link={link}
                editingId={editingId}
                onEdit={setEditingId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                setLinks={setLinks}
                links={links}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
