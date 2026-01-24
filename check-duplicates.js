const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zxblihclmfgmjddvlzec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmxpaGNsbWZnbWpkZHZsemVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODUwNDQwMCwiZXhwIjoyMDg0MDgwNDAwfQ.pUO6A12UN6RUpReoGNedYBp7wqhx3GqY8018lRO5l9w';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // Fetch all students in batches (Supabase default limit is 1000)
    let allStudents = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    console.log('Fetching all students...');
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('students')
        .select('id, "Full Name", "Student ID"')
        .order('"Student ID"')
        .range(from, from + batchSize - 1);

      if (error) {
        console.error('Error:', error);
        process.exit(1);
      }

      if (data && data.length > 0) {
        allStudents = allStudents.concat(data);
        console.log(`Fetched ${allStudents.length} students so far...`);
        from += batchSize;
        
        // If we got less than batchSize, we've reached the end
        if (data.length < batchSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`\nTotal students fetched: ${allStudents.length}\n`);

    // Find duplicates
    const studentIdMap = {};
    allStudents.forEach(student => {
      const studentId = student['Student ID'];
      if (!studentIdMap[studentId]) {
        studentIdMap[studentId] = [];
      }
      studentIdMap[studentId].push(student);
    });

    // Filter only duplicates
    const duplicates = Object.entries(studentIdMap)
      .filter(([_, students]) => students.length > 1)
      .map(([studentId, students]) => ({
        studentId,
        count: students.length,
        records: students
      }));

    if (duplicates.length > 0) {
      console.log('🔴 DUPLICATE STUDENT IDS FOUND:');
      console.log('================================\n');
      duplicates.forEach(dup => {
        console.log(`Student ID: ${dup.studentId} (appears ${dup.count} times)`);
        dup.records.forEach((rec, idx) => {
          console.log(`  [${idx + 1}] Database ID: ${rec.id} | Name: ${rec['Full Name']}`);
        });
        console.log('');
      });
      console.log(`Total Duplicate Student IDs: ${duplicates.length}`);
    } else {
      console.log('✅ NO DUPLICATE STUDENT IDS FOUND');
      console.log(`All ${allStudents.length} student records have unique Student IDs\n`);
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
