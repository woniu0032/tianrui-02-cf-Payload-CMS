import { getPayload } from 'payload'
import config from '../src/payload.config'

const ADMIN_EMAIL = 'admin@tianrui.com'
const ADMIN_PASSWORD = 'admin123'

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Initialize Payload
    const payload = await getPayload({ config })

    // Check if admin user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: ADMIN_EMAIL,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      console.log(`✅ Admin user "${ADMIN_EMAIL}" already exists. Skipping creation.`)
      process.exit(0)
    }

    // Create admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: '管理员',
        role: 'admin',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 Email:    ${ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
    console.log(`🆔 User ID:  ${adminUser.id}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🎉 Database seed completed!')
    console.log('\nYou can now log in to the admin panel at /admin')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message)
    if (error.message?.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure PostgreSQL is running and DATABASE_URL is configured correctly.')
    }
    process.exit(1)
  }
}

seed()
