import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Menu from '@/models/Menu';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Fetch all active menus, sorted by order
    const menus = await Menu.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    
    // Build hierarchical menu structure
    const menuMap = {};
    const rootMenus = [];
    
    // First pass: create map of all menus
    menus.forEach(menu => {
      menuMap[menu._id] = {
        ...menu,
        children: [],
        _id: menu._id.toString(),
        parentId: menu.parentId ? menu.parentId.toString() : null
      };
    });
    
    // Second pass: build hierarchy
    menus.forEach(menu => {
      const menuId = menu._id.toString();
      const parentId = menu.parentId ? menu.parentId.toString() : null;
      
      if (parentId && menuMap[parentId]) {
        // Add as child to parent
        menuMap[parentId].children.push(menuMap[menuId]);
      } else if (!parentId) {
        // This is a root menu
        rootMenus.push(menuMap[menuId]);
      }
    });
    
    // Sort children by order
    const sortMenus = (menus) => {
      menus.sort((a, b) => a.order - b.order);
      menus.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
      return menus;
    };
    
    const sortedMenus = sortMenus(rootMenus);
    
    return NextResponse.json({
      success: true,
      data: sortedMenus
    });
    
  } catch (error) {
    console.error('Error fetching header menus:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}