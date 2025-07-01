# Team Details View Feature

## Overview
The admin dashboard now includes a comprehensive team details view that allows administrators to view complete team information and access uploaded bank slip documents.

## Features Implemented

### 1. Team Details Dialog
- **View Details Button**: Added to each team in the Teams tab
- **Comprehensive Information Display**: Shows all team details in an organized layout
- **Role-based Access**: All admin roles can view team details

### 2. Team Information Cards
- **Team Info Card**: Team name, game type, registration date
- **Captain Contact Card**: Email and phone number
- **Players Card**: Grid layout showing all 5 players with gaming IDs and Valorant IDs

### 3. Bank Slip Document Management
- **Document Display**: Shows filename, content type, and upload status
- **Preview Functionality**: Opens documents in a new window for viewing
- **Download Functionality**: Downloads files with proper naming
- **Missing Document Handling**: Displays appropriate message when no document is uploaded

### 4. File Access Endpoints
- **Direct File Access**: `/api/files/:fileId` for accessing files by GridFS ID
- **Preview Mode**: Default inline display for document preview
- **Download Mode**: `?download=true` parameter forces file download
- **Proper Headers**: Content-Type, Content-Disposition, and caching headers

## Technical Implementation

### Frontend Components
- **State Management**: Added `selectedTeam` and `isTeamDetailsDialogOpen` states
- **Event Handlers**: `handleViewTeamDetails`, `previewBankSlip`, `downloadBankSlip`
- **UI Components**: Dialog, Cards, Badges, Buttons with proper styling

### Backend Endpoints
```typescript
// Direct file access by GridFS file ID
GET /api/files/:fileId
Query Parameters:
  - download=true (optional): Forces download instead of preview

// Response Headers:
Content-Type: file.contentType
Content-Disposition: inline|attachment; filename="filename"
Cache-Control: public, max-age=31536000
```

### Error Handling
- **File Not Found**: Proper 404 responses for missing files
- **Download Errors**: User-friendly toast notifications
- **Access Control**: Session-based authentication required

## User Interface

### Team Details Dialog Layout
```
┌─────────────────────────────────────────┐
│ Team Details: [Team Name]               │
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Team Info   │ │ Captain Contact     │ │
│ │ - Name      │ │ - Email             │ │
│ │ - Game      │ │ - Phone             │ │
│ │ - Date      │ │                     │ │
│ └─────────────┘ └─────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Team Members (Grid Layout)          │ │
│ │ [Player 1] [Player 2] [Player 3]    │ │
│ │ [Player 4] [Player 5]               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Bank Slip Document                  │ │
│ │ [Document Info] [Preview] [Download]│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Team List Updates
- Each team now has both "View Details" and "Delete" buttons
- "View Details" button available to all admin roles
- "Delete" button restricted to superuser and elite_board roles

## Security Considerations
- **Session Authentication**: All file access requires valid admin session
- **Role-based Permissions**: File access follows existing admin role structure
- **File Validation**: Only GridFS files with valid IDs can be accessed
- **Error Information**: Limited error details to prevent information disclosure

## Performance Optimizations
- **File Caching**: 1-year cache headers for static file content
- **Efficient Queries**: Direct GridFS file access by ID
- **Lazy Loading**: Team details loaded only when dialog is opened

## Future Enhancements
- **Inline Image Preview**: Display images directly in the dialog
- **Bulk Operations**: Export multiple team documents at once
- **Audit Logging**: Track who accessed which team documents
- **Advanced Filtering**: Search and filter teams by various criteria
- **Document Thumbnails**: Generate and display document previews

## Usage Instructions

### For Administrators
1. **Access Admin Dashboard**: Navigate to `/admin` and login
2. **View Teams**: Click on the "Teams" tab
3. **View Details**: Click "View Details" button on any team
4. **Preview Document**: Click "Preview" to view bank slip in new window
5. **Download Document**: Click "Download" to save bank slip locally

### For Developers
1. **File Access**: Use `/api/files/:fileId` for direct file access
2. **Download Mode**: Add `?download=true` for forced downloads
3. **Error Handling**: Check for 404 responses for missing files
4. **Authentication**: Ensure valid admin session for file access

## Testing Checklist
- [ ] Team details dialog opens and displays correctly
- [ ] All team information is properly formatted
- [ ] Player grid layout displays correctly for all team sizes
- [ ] Bank slip preview opens in new window
- [ ] Bank slip download starts with correct filename
- [ ] Missing document message displays appropriately
- [ ] Role-based access controls work correctly
- [ ] Error handling works for network issues
- [ ] File caching headers are properly set
- [ ] Session authentication is enforced
