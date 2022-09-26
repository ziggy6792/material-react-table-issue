import React, { FC, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialReactTable, { MRT_ColumnDef, Virtualizer } from 'material-react-table';
import { Typography } from '@mui/material';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { events, ITelemetryEvent } from './events';


const columns: MRT_ColumnDef<ITelemetryEvent>[] = [
  {
    accessorKey: 'time',
    header: 'Date / Time',
    // accessorFn: (row) => format(row.time, MM_dd_yyyy_HH_MM_SS),
    accessorFn: (row) => row.time.toISOString(),
  },
  {
    accessorKey: 'conversationId',
    header: 'Last Name',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'source',
    header: 'Source',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
];

const fetchSize = 125;

const Table: FC = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
  const virtualizerInstanceRef = useRef<Virtualizer>(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, fetchNextPage, isError, isFetching, isLoading } = useInfiniteQuery<ITelemetryEvent[]>(
    ['table-data', columnFilters, globalFilter, sorting],
    async ({ pageParam = null }) => {
      console.log('pageParam!', pageParam);

      const values = {
        startTime: pageParam || new Date('2022-09-26T00:00:00.000Z'),
        endTime: new Date('2022-09-27T00:00:00.000Z'),
        tenant: null,
      };


      // const { data: axiosData } = await axios.get(url.href);

      return events;
    },
    {
      getNextPageParam: (lastGroup, groups) => {
        const lastTime = lastGroup[lastGroup.length - 1]?.time;
        if (lastTime) {
          return lastTime
        }
        return null;
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  console.log('data?.pages', data?.pages);

  const flatData = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

        //once the user has scrolled within 200px of the bottom of the table, fetch more data if we can
        if (scrollHeight - scrollTop - clientHeight < 20 && !isFetching) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched]
  );

  //scroll to top of table when sorting or filters change
  // useEffect(() => {
  //   if (virtualizerInstanceRef.current) {
  //     virtualizerInstanceRef.current.scrollToIndex(0);
  //   }
  // }, [sorting, columnFilters, globalFilter]);

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
          Fetched {totalFetched} of {totalFetched} total rows.
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

const EventsTable = () => (
  <QueryClientProvider client={queryClient}>
    <Table />
  </QueryClientProvider>
);

export default EventsTable;
