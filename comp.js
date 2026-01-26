import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const COMPONENTS_PAGES_DIR = path.join(__dirname, 'src', 'components', 'pages')
const COMPONENTS_SECTIONS_DIR = path.join(__dirname, 'src', 'components', 'sections')
const SRC_DIR = path.join(__dirname, 'src')
const SCSS_PAGES_DIR = path.join(__dirname, 'src', 'scss', 'pages')
const SCSS_SECTIONS_DIR = path.join(__dirname, 'src', 'scss', 'sections')
const SCSS_PAGES_FILE = path.join(__dirname, 'src', 'scss', '_pages.scss')
const SCSS_SECTIONS_FILE = path.join(__dirname, 'src', 'scss', '_sections.scss')
const TEMPLATE_FILE = path.join(__dirname, 'src', 'template.html')

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Promisify question
function question (query) {
  return new Promise(resolve => rl.question(query, resolve))
}

// Create component files
function createComponent (componentName, type) {
  const isPage = type === 'p'
  const isSection = type === 's'
  
  const componentDir = isPage ? COMPONENTS_PAGES_DIR : COMPONENTS_SECTIONS_DIR
  const scssDir = isPage ? SCSS_PAGES_DIR : SCSS_SECTIONS_DIR
  const scssImportFile = isPage ? SCSS_PAGES_FILE : SCSS_SECTIONS_FILE
  const scssImportPath = isPage ? 'pages' : 'sections'
  const typeLabel = isPage ? 'page' : 'section'
  
  // Create component HTML file
  const htmlPath = path.join(componentDir, `${componentName}.html`)
  if (fs.existsSync(htmlPath)) {
    console.log(`⚠️  Component ${componentName}.html already exists in ${typeLabel}!`)
  } else {
    fs.writeFileSync(htmlPath, '', 'utf8')
    console.log(`✅ Created: ${htmlPath}`)
  }

  // Create page HTML file from template (only for pages)
  if (isPage) {
    createPageHtml(componentName)
  }

  // Create SCSS file with component class
  const scssPath = path.join(scssDir, `_${componentName}.scss`)
  if (fs.existsSync(scssPath)) {
    console.log(`⚠️  SCSS file _${componentName}.scss already exists in ${typeLabel}!`)
  } else {
    const scssContent = `.${componentName} {\n  \n}\n`
    fs.writeFileSync(scssPath, scssContent, 'utf8')
    console.log(`✅ Created: ${scssPath}`)
  }

  // Update _pages.scss or _sections.scss
  updateScssImports(componentName, scssImportFile, scssImportPath)
}

// Update SCSS import file (_pages.scss or _sections.scss)
function updateScssImports (componentName, scssFile, importPath) {
  if (!fs.existsSync(scssFile)) {
    console.log(`❌ Error: ${scssFile} not found!`)
    return
  }

  let content = fs.readFileSync(scssFile, 'utf8')

  // Check if component already imported
  if (content.includes(`"./${importPath}/${componentName}"`)) {
    console.log(`⚠️  Import for ${componentName} already exists in ${path.basename(scssFile)}`)
    return
  }

  // Find the position after the first import (e.g., "./pages/hero" or "./sections/hero")
  const heroImport = `"./${importPath}/`
  const heroIndex = content.indexOf(heroImport)

  if (heroIndex === -1) {
    console.log(`❌ Error: Could not find import pattern in ${path.basename(scssFile)}`)
    return
  }

  // Find the end of the first import line
  const lineEnd = content.indexOf('"', heroIndex + heroImport.length) + 1
  const insertPosition = lineEnd
  const newImport = `, "./${importPath}/${componentName}"`

  content =
    content.slice(0, insertPosition) + newImport + content.slice(insertPosition)

  fs.writeFileSync(scssFile, content, 'utf8')
  console.log(`✅ Updated: ${scssFile}`)
}

// Create page HTML file from template
function createPageHtml (componentName) {
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.log(`❌ Error: ${TEMPLATE_FILE} not found!`)
    return
  }

  const pageHtmlPath = path.join(SRC_DIR, `${componentName}.html`)
  
  if (fs.existsSync(pageHtmlPath)) {
    console.log(`⚠️  Page ${componentName}.html already exists in src/`)
    return
  }

  // Read template content
  let templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf8')
  
  // Replace {{componentName}} with actual component name
  let pageContent = templateContent.replace(/\{\{componentName\}\}/g, componentName)
  
  // Uncomment the include line
  pageContent = pageContent.replace(/<!--\s*(@@include\('components\/pages\/[^']+'\))\s*-->/g, '$1')
  
  // Write the new page file
  fs.writeFileSync(pageHtmlPath, pageContent, 'utf8')
  console.log(`✅ Created: ${pageHtmlPath}`)
}

// Main function
async function main () {
  console.log('\n🚀 Component Generator\n')

  // Check if component name and type provided as arguments
  let componentName = process.argv[2]
  let componentType = process.argv[3]

  if (!componentName) {
    componentName = await question(
      'Enter component name (e.g., test-section): '
    )
  }

  if (!componentName || componentName.trim() === '') {
    console.log('❌ Component name cannot be empty!')
    rl.close()
    return
  }

  if (!componentType) {
    componentType = await question(
      'Enter component type (p for pages, s for sections): '
    )
  }

  componentType = componentType.trim().toLowerCase()

  if (componentType !== 'p' && componentType !== 's') {
    console.log('❌ Invalid type! Use "p" for pages or "s" for sections.')
    rl.close()
    return
  }

  const normalizedName = componentName.trim().toLowerCase()
  const typeLabel = componentType === 'p' ? 'page' : 'section'

  console.log(`\n📦 Creating ${typeLabel}: ${normalizedName}\n`)

  createComponent(normalizedName, componentType)

  console.log('\n✨ Done!\n')
  rl.close()
}

// Run
main().catch(error => {
  console.error('❌ Error:', error)
  rl.close()
  process.exit(1)
})
