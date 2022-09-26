import React, { FC, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialReactTable, { MRT_ColumnDef, Virtualizer } from 'material-react-table';
import { Typography } from '@mui/material';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

type UserApiResponse = {
  data: Array<User>;
  meta: {
    totalRowCount: number;
  };
};

type User = {
  firstName: string;
  lastName: string;
  address: string;
  state: string;
  phoneNumber: string;
};

const columns: MRT_ColumnDef<User>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
  },
];

const fetchSize = 25;

const Example: FC = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
  const virtualizerInstanceRef = useRef<Virtualizer>(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, fetchNextPage, isError, isFetching, isLoading } = useInfiniteQuery<UserApiResponse>(
    ['table-data', columnFilters, globalFilter, sorting],
    async ({ pageParam = 0 }) => {
      // const url = new URL(
      //   '/api/data',
      //   'https://www.material-react-table.com',
      // );
      // url.searchParams.set('start', `${pageParam * fetchSize}`);
      // url.searchParams.set('size', `${fetchSize}`);
      // url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      // url.searchParams.set('globalFilter', globalFilter ?? '');
      // url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

      // const { data: axiosData } = await axios.get(url.href);
      // return axiosData;

      return {
        data: [
          { firstName: 'Hermann', lastName: 'Gusikowski', address: '6099 Douglas Creek', state: 'Georgia', phoneNumber: '421.698.9405' },
          { firstName: 'Milford', lastName: 'Torp', address: '410 Vicenta Radial', state: 'Alabama', phoneNumber: '805-728-7771 x75361' },
          { firstName: 'Alda', lastName: 'Koss', address: '1604 Bernardo Flats', state: 'Louisiana', phoneNumber: '860.628.3618' },
          { firstName: 'Eulah', lastName: 'Lockman', address: "7072 D'Amore Shoal", state: 'Tennessee', phoneNumber: '1-394-293-7730 x512' },
          { firstName: 'Justen', lastName: 'Hilpert', address: '386 Murray Walks', state: 'North Carolina', phoneNumber: '507.430.8224 x561' },
          { firstName: 'Vergie', lastName: 'Beatty', address: '6864 Mann Haven', state: 'Maryland', phoneNumber: '1-538-794-7917' },
          { firstName: 'Hosea', lastName: 'Herzog', address: '95688 Ada Walk', state: 'Alabama', phoneNumber: '1-330-864-0222 x01172' },
          { firstName: 'Dillan', lastName: 'Effertz', address: '94317 Hahn Causeway', state: 'New York', phoneNumber: '660-433-6667' },
          { firstName: 'Ambrose', lastName: 'Considine', address: '365 Fatima Cape', state: 'Washington', phoneNumber: '(628) 694-0650' },
          { firstName: 'Domenick', lastName: 'Runte', address: '07821 Boyle Mountain', state: 'New York', phoneNumber: '444-660-8840' },
          { firstName: 'Izaiah', lastName: 'Renner', address: '286 Kuphal Circles', state: 'Wyoming', phoneNumber: '(350) 379-3779 x15509' },
          { firstName: 'Ricardo', lastName: 'Ziemann', address: '66351 Ethan Light', state: 'Minnesota', phoneNumber: '(939) 926-9074' },
          { firstName: 'Clement', lastName: 'Cronin', address: '60065 Chris Knoll', state: 'Nebraska', phoneNumber: '(981) 319-5150 x92726' },
          { firstName: 'Bobby', lastName: 'Schuster', address: '555 Mann Trace', state: 'Arizona', phoneNumber: '432-605-5021' },
          { firstName: 'Alfreda', lastName: 'Sporer', address: '068 Nader Mountain', state: 'New Hampshire', phoneNumber: '940-724-6142' },
          { firstName: 'Gussie', lastName: 'Walter', address: '58461 Pat Grove', state: 'Alabama', phoneNumber: '520-922-7671' },
          { firstName: 'Javier', lastName: 'Douglas', address: '162 Pacocha Ranch', state: 'New York', phoneNumber: '(370) 993-8299' },
          { firstName: 'Sydney', lastName: 'Armstrong', address: '725 Stracke Landing', state: 'Mississippi', phoneNumber: '910.942.8141' },
          { firstName: 'Justine', lastName: 'Langworth', address: '772 Casimer Shoal', state: 'South Dakota', phoneNumber: '(350) 810-1145' },
          { firstName: 'Anabel', lastName: 'Leannon', address: '51230 Dewayne Camp', state: 'Kansas', phoneNumber: '1-888-752-3953' },
          { firstName: 'Ally', lastName: 'Goodwin', address: '707 Howe Mountains', state: 'West Virginia', phoneNumber: '1-786-215-5832 x4409' },
          { firstName: 'Tianna', lastName: 'Lang', address: '200 Labadie Vista', state: 'Montana', phoneNumber: '697-639-3479 x6460' },
          { firstName: 'Noemi', lastName: 'Marquardt', address: '8239 Paucek Prairie', state: 'North Carolina', phoneNumber: '1-677-610-6588' },
          { firstName: 'Leonardo', lastName: 'Sawayn', address: '12643 Howell Locks', state: 'Missouri', phoneNumber: '283-273-3920 x41098' },
          { firstName: 'Melany', lastName: 'Corkery', address: '333 Upton Manor', state: 'Arkansas', phoneNumber: '(826) 688-1496 x638' },
        ],
        meta: { totalRowCount: 200 },
      };
    },
    {
      getNextPageParam: (_lastGroup, groups) => groups.length,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const flatData = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        console.log('containerRefElement', containerRefElement);
        console.log('scrollHeight', scrollHeight);
        //once the user has scrolled within 200px of the bottom of the table, fetch more data if we can
        if (scrollHeight - scrollTop - clientHeight < 200 && !isFetching && totalFetched < totalDBRowCount) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  //scroll to top of table when sorting or filters change
  useEffect(() => {
    if (virtualizerInstanceRef.current) {
      virtualizerInstanceRef.current.scrollToIndex(0);
    }
  }, [sorting, columnFilters, globalFilter]);

  //a check on mount to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  return (
    <MaterialReactTable
      columns={columns}
      data={flatData}
      enablePagination={false}
      enableRowNumbers
      enableRowVirtualization //optional, but recommended if it is likely going to be more than 100 rows
      manualFiltering
      manualSorting
      muiTableContainerProps={{
        ref: tableContainerRef, //get access to the table container element
        sx: { maxHeight: '600px' }, //give the table a max height
        onScroll: (
          event: UIEvent<HTMLDivElement> //add an event listener to the table container element
        ) => fetchMoreOnBottomReached(event.target as HTMLDivElement),
      }}
      muiToolbarAlertBannerProps={
        isError
          ? {
              color: 'error',
              children: 'Error loading data',
            }
          : undefined
      }
      onColumnFiltersChange={setColumnFilters}
      onGlobalFilterChange={setGlobalFilter}
      onSortingChange={setSorting}
      renderBottomToolbarCustomActions={() => (
        <Typography>
          Fetched {totalFetched} of {totalDBRowCount} total rows.
        </Typography>
      )}
      state={{
        columnFilters,
        globalFilter,
        isLoading,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting,
      }}
      virtualizerInstanceRef={virtualizerInstanceRef} //get access to the virtualizer instance
    />
  );
};

const queryClient = new QueryClient();

const ExampleWithReactQueryProvider = () => (
  <QueryClientProvider client={queryClient}>
    <Example />
  </QueryClientProvider>
);

export default ExampleWithReactQueryProvider;
