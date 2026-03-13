// scripts/seed-menus.js
import mongoose from 'mongoose';
import Menu from '../models/Menu';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const menus = [
  {
    label: 'HOME',
    path: '/',
    menuType: 'single',
    order: 0,
    isActive: true
  },
  {
    label: 'ABOUT',
    menuType: 'dropdown',
    order: 1,
    isActive: true,
    children: [
      {
        label: '1. ABOUT OUR HISTORY',
        path: '/about/history',
        order: 0,
        isActive: true
      },
      {
        label: '2. WHO IS DR. B.R. AMBEDKAR?',
        path: '/about/ambedkar',
        order: 1,
        isActive: true
      },
      {
        label: '3. GOVERNING BODY',
        path: '/about/governing-body',
        order: 2,
        isActive: true
      },
      {
        label: '4. ANNUAL REPORTS',
        path: '/about/reports',
        order: 3,
        isActive: true
      },
      {
        label: '5. MEDIA CENTRE',
        path: '/about/media',
        order: 4,
        isActive: true
      }
    ]
  },
  {
    label: 'OUR FOCUS AREAS',
    menuType: 'dropdown',
    order: 2,
    isActive: true,
    children: [
      {
        label: '1. WOMEN EMPOWERMENT',
        path: '/focus/women',
        order: 0,
        isActive: true
      },
      {
        label: '2. CHILD WELFARE',
        path: '/focus/child',
        order: 1,
        isActive: true
      },
      {
        label: '3. EDUCATION',
        path: '/focus/education',
        order: 2,
        isActive: true
      },
      {
        label: '4. SCIENCE & TECHNOLOGY',
        path: '/focus/science',
        order: 3,
        isActive: true
      },
      {
        label: '5. HEALTH & NUTRITION',
        path: '/focus/health',
        order: 4,
        isActive: true
      },
      {
        label: '6. RURAL DEVELOPMENT',
        path: '/focus/rural',
        order: 5,
        isActive: true
      },
      {
        label: '7. ENVIRONMENT',
        path: '/focus/environment',
        order: 6,
        isActive: true
      },
      {
        label: '8. YOUTH WELFARE',
        path: '/focus/youth',
        order: 7,
        isActive: true
      }
    ]
  },
  {
    label: 'OUR PROGRAMMES',
    path: '/programmes',
    menuType: 'single',
    order: 3,
    isActive: true
  },
  {
    label: 'WORKSHOPS & EVENTS',
    path: '/events',
    menuType: 'single',
    order: 4,
    isActive: true
  },
  {
    label: 'CONTACT US',
    path: '/contact',
    menuType: 'single',
    order: 5,
    isActive: true
  }
];

async function seedMenus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing menus
    await Menu.deleteMany({});
    console.log('Cleared existing menus');

    // Insert menus with parent-child relationships
    for (const menu of menus) {
      if (menu.children) {
        const parentMenu = await Menu.create({
          label: menu.label,
          menuType: menu.menuType,
          order: menu.order,
          isActive: menu.isActive
        });

        for (const child of menu.children) {
          const childMenu = await Menu.create({
            ...child,
            parentId: parentMenu._id
          });
          
          // Add child to parent's children array
          parentMenu.children.push(childMenu._id);
        }
        
        await parentMenu.save();
      } else {
        await Menu.create(menu);
      }
    }

    console.log('Menus seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding menus:', error);
    process.exit(1);
  }
}

seedMenus();