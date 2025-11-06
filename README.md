# Garmac - Adding Items Guide

## How to Add New Items

To add a new item to the registry, follow these simple steps:

### 1. Add the Item JSON Entry

Open `items.json` and add a new item object to the `items` array with the following structure:

```json
{
  "id": "your-item-id",
  "name": "Item Display Name",
  "description": "Brief description of the item",
  "image": "items/your-image-filename.jpg",
  "targetAmount": 15000,
  "contributedAmount": 0
}
```

#### Field Descriptions:
- **id**: Unique identifier (use lowercase with hyphens)
- **name**: Display name shown to users
- **description**: Brief description of the item
- **image**: Path to image file (must be in `items/` folder)
- **targetAmount**: Target contribution amount in cents
- **contributedAmount**: Current contribution amount (usually start with 0)

### 2. Add the Item Image

1. Place your item image in the `items/` folder
2. Use a descriptive filename that matches your item ID
3. Supported formats: `.jpg`, `.jpeg`, `.png`
4. Recommended size: Square aspect ratio for best display

### Example

Here's how the files should look:

**items.json** (add to the items array):
```json
{
  "id": "coffee-maker",
  "name": "Coffee Maker",
  "description": "Premium coffee maker for morning brew",
  "image": "items/coffee-maker.jpg",
  "targetAmount": 20000,
  "contributedAmount": 0
}
```

**File structure**:
```
items/
  coffee-maker.jpg  ← Your image file
  air-fryer.jpg
  stand-mixer.jpg
  ...
```

That's it! The item will automatically appear on the website once both the JSON entry and image are added.
