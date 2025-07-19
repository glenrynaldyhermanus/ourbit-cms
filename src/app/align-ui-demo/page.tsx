"use client";

import {
	Button,
	PrimaryButton,
	DestructiveButton,
	OutlineButton,
	SecondaryButton,
	GhostButton,
	LinkButton,
	AlignSwitch,
	AlignInput,
	AlignSelect,
	Table,
	AlignStats,
} from "@/components/ui";
import {
	Plus,
	Trash2,
	Edit,
	Save,
	User,
	Settings,
	Search,
	Mail,
	Lock,
	Package,
	DollarSign,
	Calendar,
	TrendingUp,
	ShoppingCart,
	Users,
	BarChart3,
} from "lucide-react";

export default function AlignUIDemo() {
	return (
		<div className="min-h-screen bg-white p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				<h1 className="text-3xl font-bold text-center mb-8">
					Align UI Components Demo
				</h1>

				{/* Button Variants */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Button Variants</h2>
					<div className="flex flex-wrap gap-4">
						<PrimaryButton>Primary Button</PrimaryButton>
						<DestructiveButton>Destructive Button</DestructiveButton>
						<OutlineButton>Outline Button</OutlineButton>
						<SecondaryButton>Secondary Button</SecondaryButton>
						<GhostButton>Ghost Button</GhostButton>
						<LinkButton>Link Button</LinkButton>
					</div>
				</section>

				{/* Button Sizes */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Button Sizes</h2>
					<div className="flex flex-wrap items-center gap-4">
						<Button size="sm">Small</Button>
						<Button size="default">Default</Button>
						<Button size="lg">Large</Button>
						<Button size="icon">
							<Plus />
						</Button>
					</div>
				</section>

				{/* Button with Icons */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Buttons with Icons</h2>
					<div className="flex flex-wrap gap-4">
						<Button.Root variant="default">
							<Button.Icon icon={Plus} />
							<Button.Text>Add Item</Button.Text>
						</Button.Root>
						<Button.Root variant="destructive">
							<Button.Icon icon={Trash2} />
							<Button.Text>Delete</Button.Text>
						</Button.Root>
						<Button.Root variant="outline">
							<Button.Icon icon={Edit} />
							<Button.Text>Edit & Save</Button.Text>
							<Button.Icon icon={Save} />
						</Button.Root>
					</div>
				</section>

				{/* Loading States */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Loading States</h2>
					<div className="flex flex-wrap gap-4">
						<PrimaryButton loading>Loading...</PrimaryButton>
						<DestructiveButton loading>Deleting...</DestructiveButton>
						<OutlineButton loading>Saving...</OutlineButton>
					</div>
				</section>

				{/* Disabled States */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Disabled States</h2>
					<div className="flex flex-wrap gap-4">
						<PrimaryButton disabled>Disabled Primary</PrimaryButton>
						<DestructiveButton disabled>
							Disabled Destructive
						</DestructiveButton>
						<OutlineButton disabled>Disabled Outline</OutlineButton>
					</div>
				</section>

				{/* Switch Component */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Switch Component</h2>
					<div className="space-y-4">
						<AlignSwitch
							checked={true}
							onChange={() => {}}
							label="Notifications"
							description="Receive notifications about new updates"
						/>
						<AlignSwitch
							checked={false}
							onChange={() => {}}
							label="Dark Mode"
							description="Switch to dark theme"
						/>
						<AlignSwitch
							checked={true}
							onChange={() => {}}
							disabled
							label="Disabled Switch"
							description="This switch is disabled"
						/>
					</div>
				</section>

				{/* Compound Components Demo */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Compound Components Demo</h2>
					<div className="flex flex-wrap gap-4">
						<Button.Root variant="default" size="lg">
							<Button.Icon icon={User} />
							<Button.Text>User Profile</Button.Text>
						</Button.Root>
						<Button.Root variant="outline" size="sm">
							<Button.Icon icon={Settings} />
							<Button.Text>Settings</Button.Text>
						</Button.Root>
						<Button.Root variant="ghost" size="icon">
							<Button.Icon icon={Plus} />
						</Button.Root>
					</div>
				</section>

				{/* Input Components */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Input Components</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<AlignInput.Root>
								<AlignInput.Label>Email Address</AlignInput.Label>
								<AlignInput.Root>
									<AlignInput.Icon icon={Mail} position="leading" />
									<AlignInput.Field
										type="email"
										placeholder="Enter your email"
										className="pl-10"
									/>
								</AlignInput.Root>
							</AlignInput.Root>

							<AlignInput.Root>
								<AlignInput.Label required>Password</AlignInput.Label>
								<AlignInput.Root>
									<AlignInput.Icon icon={Lock} position="leading" />
									<AlignInput.Field
										type="password"
										placeholder="Enter your password"
										className="pl-10"
									/>
								</AlignInput.Root>
							</AlignInput.Root>

							<AlignInput.Root error>
								<AlignInput.Label>Error Input</AlignInput.Label>
								<AlignInput.Field
									placeholder="This field has an error"
									className="border-red-500"
								/>
								<AlignInput.Error>This field is required</AlignInput.Error>
							</AlignInput.Root>
						</div>

						<div className="space-y-4">
							<AlignInput.Root>
								<AlignInput.Label>Search</AlignInput.Label>
								<AlignInput.Root>
									<AlignInput.Icon icon={Search} position="leading" />
									<AlignInput.Field
										placeholder="Search products..."
										className="pl-10"
									/>
								</AlignInput.Root>
							</AlignInput.Root>

							<AlignInput.Root>
								<AlignInput.Label>Disabled Input</AlignInput.Label>
								<AlignInput.Root disabled>
									<AlignInput.Field
										value="This is disabled"
										disabled
										className="opacity-50"
									/>
								</AlignInput.Root>
							</AlignInput.Root>

							<AlignInput.Root>
								<AlignInput.Label>Number Input</AlignInput.Label>
								<AlignInput.Field type="number" placeholder="Enter amount" />
							</AlignInput.Root>
						</div>
					</div>
				</section>

				{/* Select Components */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Select Components</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<AlignSelect.Root>
								<AlignSelect.Label>Category</AlignSelect.Label>
								<AlignSelect.Trigger
									placeholder="Select a category"
									value="Electronics"
								/>
							</AlignSelect.Root>

							<AlignSelect.Root>
								<AlignSelect.Label required>Product Type</AlignSelect.Label>
								<AlignSelect.Trigger placeholder="Select product type" error />
								<AlignSelect.Error>
									Please select a product type
								</AlignSelect.Error>
							</AlignSelect.Root>
						</div>

						<div className="space-y-4">
							<AlignSelect.Root>
								<AlignSelect.Label>Status</AlignSelect.Label>
								<AlignSelect.Trigger
									placeholder="Select status"
									value="Active"
								/>
							</AlignSelect.Root>

							<AlignSelect.Root>
								<AlignSelect.Label>Disabled Select</AlignSelect.Label>
								<AlignSelect.Root disabled>
									<AlignSelect.Trigger
										placeholder="This is disabled"
										disabled
									/>
								</AlignSelect.Root>
							</AlignSelect.Root>
						</div>
					</div>
				</section>

				{/* Stats Components */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Stats Components</h2>
					<div className="space-y-6">
						{/* Basic Stats */}
						<div>
							<h3 className="text-lg font-medium mb-4">Basic Stats</h3>
							<AlignStats.Grid>
								<AlignStats.Card
									title="Total Products"
									value={248}
									change={{
										value: "+12",
										type: "positive",
										period: "this week",
									}}
									icon={Package}
									iconColor="bg-orange-500/10 text-orange-600"
								/>
								<AlignStats.Card
									title="Active Listings"
									value={186}
									change={{
										value: "+2%",
										type: "positive",
										period: "of total",
									}}
									icon={ShoppingCart}
									iconColor="bg-green-500/10 text-green-600"
								/>
								<AlignStats.Card
									title="Total Sales"
									value={8944}
									change={{
										value: "+2.1%",
										type: "positive",
										period: "this week",
									}}
									icon={TrendingUp}
									iconColor="bg-blue-500/10 text-blue-600"
								/>
								<AlignStats.Card
									title="Total Revenue"
									value="$8,944"
									change={{
										value: "-0.5%",
										type: "negative",
										period: "vs last week",
									}}
									icon={DollarSign}
									iconColor="bg-purple-500/10 text-purple-600"
								/>
							</AlignStats.Grid>
						</div>

						{/* Different Grid Layouts */}
						<div>
							<h3 className="text-lg font-medium mb-4">
								Different Grid Layouts
							</h3>
							<div className="space-y-6">
								{/* 2 Columns */}
								<div>
									<h4 className="text-md font-medium mb-3">2 Columns</h4>
									<AlignStats.Grid columns={2}>
										<AlignStats.Card
											title="Users"
											value={1247}
											change={{
												value: "+15%",
												type: "positive",
												period: "this month",
											}}
											icon={Users}
											iconColor="bg-indigo-500/10 text-indigo-600"
										/>
										<AlignStats.Card
											title="Analytics"
											value={89}
											change={{
												value: "+5%",
												type: "positive",
												period: "this week",
											}}
											icon={BarChart3}
											iconColor="bg-teal-500/10 text-teal-600"
										/>
									</AlignStats.Grid>
								</div>

								{/* 3 Columns */}
								<div>
									<h4 className="text-md font-medium mb-3">3 Columns</h4>
									<AlignStats.Grid columns={3}>
										<AlignStats.Card
											title="Revenue"
											value="$12,847"
											change={{
												value: "+23%",
												type: "positive",
												period: "this month",
											}}
											icon={DollarSign}
											iconColor="bg-green-500/10 text-green-600"
										/>
										<AlignStats.Card
											title="Orders"
											value={456}
											change={{
												value: "+12%",
												type: "positive",
												period: "this week",
											}}
											icon={ShoppingCart}
											iconColor="bg-orange-500/10 text-orange-600"
										/>
										<AlignStats.Card
											title="Products"
											value={89}
											change={{
												value: "+3",
												type: "positive",
												period: "this week",
											}}
											icon={Package}
											iconColor="bg-blue-500/10 text-blue-600"
										/>
									</AlignStats.Grid>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Table Components */}
				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">Table Components</h2>
					<div className="space-y-6">
						{/* Basic Table */}
						<div>
							<h3 className="text-lg font-medium mb-4">Basic Table</h3>
							<Table.Root className="border rounded-lg">
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Product</Table.HeaderCell>
										<Table.HeaderCell align="center">
											Category
										</Table.HeaderCell>
										<Table.HeaderCell align="right">
											Price
										</Table.HeaderCell>
										<Table.HeaderCell align="center">
											Stock
										</Table.HeaderCell>
										<Table.HeaderCell align="center">
											Actions
										</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									<Table.Row>
										<Table.Cell>
											<div className="flex items-center gap-3">
												<Table.Icon icon={Package} />
												<div>
													<div className="font-medium">iPhone 15 Pro</div>
													<div className="text-sm text-muted-foreground">
														IPH-001
													</div>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell align="center">
											Electronics
										</Table.Cell>
										<Table.Cell align="right">
											Rp 15.000.000
										</Table.Cell>
										<Table.Cell align="center">25</Table.Cell>
										<Table.Cell align="center">
											<div className="flex items-center gap-2">
												<button className="p-1 hover:bg-muted rounded">
													<Edit className="h-4 w-4" />
												</button>
												<button className="p-1 hover:bg-muted rounded text-destructive">
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>
											<div className="flex items-center gap-3">
												<Table.Icon icon={Package} />
												<div>
													<div className="font-medium">MacBook Air M2</div>
													<div className="text-sm text-muted-foreground">
														MAC-001
													</div>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell align="center">
											Electronics
										</Table.Cell>
										<Table.Cell align="right">
											Rp 18.500.000
										</Table.Cell>
										<Table.Cell align="center">12</Table.Cell>
										<Table.Cell align="center">
											<div className="flex items-center gap-2">
												<button className="p-1 hover:bg-muted rounded">
													<Edit className="h-4 w-4" />
												</button>
												<button className="p-1 hover:bg-muted rounded text-destructive">
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</div>

						{/* Sortable Table */}
						<div>
							<h3 className="text-lg font-medium mb-4">Sortable Table</h3>
							<Table.Root className="border rounded-lg">
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell sortable>Name</Table.HeaderCell>
										<Table.HeaderCell sortable align="center">
											Date
										</Table.HeaderCell>
										<Table.HeaderCell sortable align="right">
											Amount
										</Table.HeaderCell>
										<Table.HeaderCell align="center">
											Status
										</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									<Table.Row>
										<Table.Cell>John Doe</Table.Cell>
										<Table.Cell align="center">2024-01-15</Table.Cell>
										<Table.Cell align="right">
											Rp 2.500.000
										</Table.Cell>
										<Table.Cell align="center">
											<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
												Completed
											</span>
										</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>Jane Smith</Table.Cell>
										<Table.Cell align="center">2024-01-14</Table.Cell>
										<Table.Cell align="right">
											Rp 1.800.000
										</Table.Cell>
										<Table.Cell align="center">
											<span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
												Pending
											</span>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</div>

						{/* Empty Table */}
						<div>
							<h3 className="text-lg font-medium mb-4">Empty Table</h3>
							<Table.Root className="border rounded-lg">
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Product</Table.HeaderCell>
										<Table.HeaderCell align="center">
											Category
										</Table.HeaderCell>
										<Table.HeaderCell align="right">
											Price
										</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									<Table.Empty icon={Package}>
										No products found
									</Table.Empty>
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
